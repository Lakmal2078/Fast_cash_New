import { prisma } from '../../prisma/client';
import { generateReference } from '../../utils/reference';
import { auditService } from '../audit/audit.service';
import { addJob } from '../../queue/queue';
import fs from 'fs';
import path from 'path';

const MIN_DEPOSIT = 500;
const MAX_DEPOSIT = 500000;

export const depositsService = {
  async create(data: {
    userId: string;
    amount: number;
    paymentAccountId: string;
    receiptUrl?: string;
    receiptKey?: string;
    note?: string;
    idempotencyKey: string;
  }, ip?: string) {
    // Check idempotency
    const existing = await prisma.idempotencyRecord.findUnique({
      where: { key: data.idempotencyKey },
    });
    if (existing) {
      return existing.response as Record<string, unknown>;
    }

    if (data.amount < MIN_DEPOSIT || data.amount > MAX_DEPOSIT) {
      throw Object.assign(
        new Error(`Deposit amount must be between Rs. ${MIN_DEPOSIT} and Rs. ${MAX_DEPOSIT}`),
        { statusCode: 400, code: 'INVALID_AMOUNT' }
      );
    }

    const account = await prisma.paymentAccount.findFirst({
      where: { id: data.paymentAccountId, isActive: true },
    });
    if (!account) {
      throw Object.assign(new Error('Payment account not found'), { statusCode: 404, code: 'ACCOUNT_NOT_FOUND' });
    }

    const referenceNumber = await generateReference('DEP');

    const deposit = await prisma.depositRequest.create({
      data: {
        referenceNumber,
        userId: data.userId,
        amount: data.amount,
        paymentAccountId: data.paymentAccountId,
        receiptUrl: data.receiptUrl,
        receiptKey: data.receiptKey,
        note: data.note,
        idempotencyKey: data.idempotencyKey,
        status: 'PENDING',
      },
      include: { paymentAccount: true },
    });

    // Update pending balance
    await prisma.user.update({
      where: { id: data.userId },
      data: { pendingBalance: { increment: data.amount } },
    });

    // Store idempotency record (24h TTL)
    await prisma.idempotencyRecord.create({
      data: {
        key: data.idempotencyKey,
        response: deposit as unknown as object,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await auditService.log({
      actorId: data.userId,
      actorRole: 'CUSTOMER',
      action: 'DEPOSIT_CREATED',
      entityType: 'DepositRequest',
      entityId: deposit.id,
      metadata: { amount: data.amount, reference: referenceNumber },
      ipAddress: ip,
    });

    addJob('whatsapp-notification', {
      type: 'deposit_submitted',
      reference: referenceNumber,
      amount: data.amount,
    });

    return deposit;
  },

  async getUserDeposits(userId: string, page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where = {
      userId,
      ...(status && { status: status as never }),
    };

    const [deposits, total] = await Promise.all([
      prisma.depositRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { paymentAccount: { select: { bankName: true, branch: true } } },
      }),
      prisma.depositRequest.count({ where }),
    ]);

    return { deposits, total, page, limit };
  },

  async getById(id: string, userId?: string) {
    const deposit = await prisma.depositRequest.findFirst({
      where: { id, ...(userId && { userId }) },
      include: { paymentAccount: true, user: { select: { username: true, fullName: true, mobileNumber: true } } },
    });

    if (!deposit) {
      throw Object.assign(new Error('Deposit not found'), { statusCode: 404, code: 'NOT_FOUND' });
    }

    return deposit;
  },

  async getUploadUrl(userId: string, filename: string, mimeType: string) {
    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(filename).toLowerCase();

    if (!allowedMimes.includes(mimeType) || !allowedExts.includes(ext)) {
      throw Object.assign(
        new Error('Only JPG, PNG and PDF files are allowed'),
        { statusCode: 400, code: 'INVALID_FILE_TYPE' }
      );
    }

    // For local storage: return a signed-style upload endpoint
    const key = `receipts/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    return {
      uploadUrl: `/api/deposits/upload/${encodeURIComponent(key)}`,
      key,
      method: 'PUT',
    };
  },

  async approve(depositId: string, adminId: string, ip?: string) {
    return prisma.$transaction(async (tx) => {
      // Lock the deposit record
      const deposit = await tx.depositRequest.findUnique({ where: { id: depositId } });
      if (!deposit) throw Object.assign(new Error('Deposit not found'), { statusCode: 404 });
      if (deposit.status !== 'PENDING' && deposit.status !== 'UNDER_REVIEW') {
        throw Object.assign(
          new Error('Deposit cannot be approved in its current state'),
          { statusCode: 409, code: 'INVALID_STATE' }
        );
      }

      const updated = await tx.depositRequest.update({
        where: { id: depositId },
        data: { status: 'APPROVED', reviewedBy: adminId, reviewedAt: new Date() },
      });

      // Credit wallet, clear pending
      await tx.user.update({
        where: { id: deposit.userId },
        data: {
          walletBalance: { increment: deposit.amount },
          pendingBalance: { decrement: deposit.amount },
        },
      });

      return updated;
    }).then(async (updated) => {
      await auditService.log({
        actorId: adminId,
        actorRole: 'ADMIN',
        action: 'DEPOSIT_APPROVED',
        entityType: 'DepositRequest',
        entityId: depositId,
        metadata: { amount: updated.amount.toString(), reference: updated.referenceNumber },
        ipAddress: ip,
      });

      addJob('whatsapp-notification', {
        type: 'deposit_approved',
        reference: updated.referenceNumber,
        amount: updated.amount,
        userId: updated.userId,
      });

      return updated;
    });
  },

  async reject(depositId: string, adminId: string, reason: string, ip?: string) {
    return prisma.$transaction(async (tx) => {
      const deposit = await tx.depositRequest.findUnique({ where: { id: depositId } });
      if (!deposit) throw Object.assign(new Error('Deposit not found'), { statusCode: 404 });
      if (deposit.status !== 'PENDING' && deposit.status !== 'UNDER_REVIEW') {
        throw Object.assign(new Error('Deposit cannot be rejected in its current state'), { statusCode: 409, code: 'INVALID_STATE' });
      }

      const updated = await tx.depositRequest.update({
        where: { id: depositId },
        data: { status: 'REJECTED', rejectionReason: reason, reviewedBy: adminId, reviewedAt: new Date() },
      });

      // Release pending balance
      await tx.user.update({
        where: { id: deposit.userId },
        data: { pendingBalance: { decrement: deposit.amount } },
      });

      return updated;
    }).then(async (updated) => {
      await auditService.log({
        actorId: adminId,
        actorRole: 'ADMIN',
        action: 'DEPOSIT_REJECTED',
        entityType: 'DepositRequest',
        entityId: depositId,
        metadata: { reason, reference: updated.referenceNumber },
        ipAddress: ip,
      });

      addJob('whatsapp-notification', {
        type: 'deposit_rejected',
        reference: updated.referenceNumber,
        reason,
        userId: updated.userId,
      });

      return updated;
    });
  },

  async saveUploadedFile(key: string, fileBuffer: Buffer): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', path.dirname(key.replace('receipts/', '')));
    fs.mkdirSync(path.join(process.cwd(), 'uploads', 'receipts', key.split('/')[1] || ''), { recursive: true });
    const fullPath = path.join(process.cwd(), 'uploads', key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, fileBuffer);
    return `/uploads/${key}`;
  },
};

import { prisma } from '../../prisma/client';
import { generateReference } from '../../utils/reference';
import { auditService } from '../audit/audit.service';
import { addJob } from '../../queue/queue';
import { maskAccountNumber, encryptAccountNumber } from '../../utils/hash';
import { Decimal } from '@prisma/client/runtime/library';

const MIN_WITHDRAWAL = 1000;
const MAX_WITHDRAWAL = 200000;
const MAX_PENDING_WITHDRAWALS = 3;

export const withdrawalsService = {
  async create(data: {
    userId: string;
    amount: number;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    branch?: string;
    note?: string;
    idempotencyKey: string;
  }, ip?: string) {
    // Check idempotency
    const existing = await prisma.idempotencyRecord.findUnique({
      where: { key: data.idempotencyKey },
    });
    if (existing) return existing.response as Record<string, unknown>;

    if (data.amount < MIN_WITHDRAWAL || data.amount > MAX_WITHDRAWAL) {
      throw Object.assign(
        new Error(`Withdrawal amount must be between Rs. ${MIN_WITHDRAWAL} and Rs. ${MAX_WITHDRAWAL}`),
        { statusCode: 400, code: 'INVALID_AMOUNT' }
      );
    }

    return prisma.$transaction(async (tx) => {
      // Lock user record to prevent race conditions
      const user = await tx.user.findUnique({ where: { id: data.userId } });
      if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

      const balance = new Decimal(user.walletBalance.toString());
      const amount = new Decimal(data.amount);

      if (balance.lessThan(amount)) {
        throw Object.assign(
          new Error('Insufficient balance'),
          { statusCode: 400, code: 'INSUFFICIENT_BALANCE' }
        );
      }

      // Check pending withdrawal limit
      const pendingCount = await tx.withdrawalRequest.count({
        where: { userId: data.userId, status: 'PENDING' },
      });
      if (pendingCount >= MAX_PENDING_WITHDRAWALS) {
        throw Object.assign(
          new Error('You have too many pending withdrawal requests. Please wait for them to be processed.'),
          { statusCode: 400, code: 'PENDING_LIMIT_EXCEEDED' }
        );
      }

      const referenceNumber = await generateReference('WDR');
      const masked = maskAccountNumber(data.accountNumber);
      const encrypted = encryptAccountNumber(data.accountNumber);

      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          referenceNumber,
          userId: data.userId,
          amount: data.amount,
          bankName: data.bankName,
          accountHolder: data.accountHolder,
          maskedAccountNumber: masked,
          accountNumberEncrypted: encrypted,
          branch: data.branch,
          note: data.note,
          idempotencyKey: data.idempotencyKey,
          status: 'PENDING',
        },
      });

      // Deduct from wallet balance immediately (hold)
      await tx.user.update({
        where: { id: data.userId },
        data: {
          walletBalance: { decrement: data.amount },
          pendingBalance: { increment: data.amount },
        },
      });

      return withdrawal;
    }).then(async (withdrawal) => {
      // Store idempotency record
      await prisma.idempotencyRecord.create({
        data: {
          key: data.idempotencyKey,
          response: withdrawal as unknown as Record<string, unknown>,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      await auditService.log({
        actorId: data.userId,
        actorRole: 'CUSTOMER',
        action: 'WITHDRAWAL_CREATED',
        entityType: 'WithdrawalRequest',
        entityId: withdrawal.id,
        metadata: { amount: data.amount, reference: withdrawal.referenceNumber },
        ipAddress: ip,
      });

      addJob('whatsapp-notification', {
        type: 'withdrawal_submitted',
        reference: withdrawal.referenceNumber,
        amount: data.amount,
        userId: data.userId,
      });

      return withdrawal;
    });
  },

  async getUserWithdrawals(userId: string, page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where = { userId, ...(status && { status: status as never }) };

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawalRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, referenceNumber: true, amount: true, bankName: true,
          accountHolder: true, maskedAccountNumber: true, branch: true,
          status: true, rejectionReason: true, createdAt: true, updatedAt: true,
        },
      }),
      prisma.withdrawalRequest.count({ where }),
    ]);

    return { withdrawals, total, page, limit };
  },

  async approve(withdrawalId: string, adminId: string, ip?: string) {
    return prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
      if (!withdrawal) throw Object.assign(new Error('Withdrawal not found'), { statusCode: 404 });
      if (withdrawal.status !== 'PENDING' && withdrawal.status !== 'UNDER_REVIEW') {
        throw Object.assign(new Error('Cannot approve in current state'), { statusCode: 409, code: 'INVALID_STATE' });
      }

      const updated = await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: { status: 'APPROVED', reviewedBy: adminId, reviewedAt: new Date() },
      });

      // Release pending balance
      await tx.user.update({
        where: { id: withdrawal.userId },
        data: { pendingBalance: { decrement: withdrawal.amount } },
      });

      return updated;
    }).then(async (updated) => {
      await auditService.log({
        actorId: adminId, actorRole: 'ADMIN',
        action: 'WITHDRAWAL_APPROVED',
        entityType: 'WithdrawalRequest', entityId: withdrawalId,
        metadata: { amount: updated.amount.toString(), reference: updated.referenceNumber },
        ipAddress: ip,
      });

      addJob('whatsapp-notification', {
        type: 'withdrawal_approved',
        reference: updated.referenceNumber,
        userId: updated.userId,
      });

      return updated;
    });
  },

  async reject(withdrawalId: string, adminId: string, reason: string, ip?: string) {
    return prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
      if (!withdrawal) throw Object.assign(new Error('Withdrawal not found'), { statusCode: 404 });
      if (withdrawal.status !== 'PENDING' && withdrawal.status !== 'UNDER_REVIEW') {
        throw Object.assign(new Error('Cannot reject in current state'), { statusCode: 409, code: 'INVALID_STATE' });
      }

      const updated = await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: { status: 'REJECTED', rejectionReason: reason, reviewedBy: adminId, reviewedAt: new Date() },
      });

      // Refund wallet
      await tx.user.update({
        where: { id: withdrawal.userId },
        data: {
          walletBalance: { increment: withdrawal.amount },
          pendingBalance: { decrement: withdrawal.amount },
        },
      });

      return updated;
    }).then(async (updated) => {
      await auditService.log({
        actorId: adminId, actorRole: 'ADMIN',
        action: 'WITHDRAWAL_REJECTED',
        entityType: 'WithdrawalRequest', entityId: withdrawalId,
        metadata: { reason, reference: updated.referenceNumber },
        ipAddress: ip,
      });

      addJob('whatsapp-notification', {
        type: 'withdrawal_rejected',
        reference: updated.referenceNumber,
        reason,
        userId: updated.userId,
      });

      return updated;
    });
  },
};

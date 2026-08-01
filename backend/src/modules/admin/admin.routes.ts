import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { depositsService } from '../deposits/deposits.service';
import { withdrawalsService } from '../withdrawals/withdrawals.service';
import { auditService } from '../audit/audit.service';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ── Dashboard Stats ──────────────────────────────────────────
router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);

    const [
      totalCustomers,
      pendingDeposits,
      pendingWithdrawals,
      todayDeposits,
      todayWithdrawals,
      approvedDeposits,
      rejectedDeposits,
      recentDeposits,
      recentWithdrawals,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.depositRequest.count({ where: { status: 'PENDING' } }),
      prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
      prisma.depositRequest.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow } },
        _sum: { amount: true }, _count: { id: true },
      }),
      prisma.withdrawalRequest.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow } },
        _sum: { amount: true }, _count: { id: true },
      }),
      prisma.depositRequest.count({ where: { status: 'APPROVED' } }),
      prisma.depositRequest.count({ where: { status: 'REJECTED' } }),
      prisma.depositRequest.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true, fullName: true } }, paymentAccount: { select: { bankName: true } } },
      }),
      prisma.withdrawalRequest.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true, fullName: true } } },
      }),
    ]);

    return successResponse(res, {
      totalCustomers,
      pendingDeposits,
      pendingWithdrawals,
      todayDepositsAmount: todayDeposits._sum.amount || 0,
      todayDepositsCount: todayDeposits._count.id,
      todayWithdrawalsAmount: todayWithdrawals._sum.amount || 0,
      todayWithdrawalsCount: todayWithdrawals._count.id,
      approvedDeposits,
      rejectedDeposits,
      recentDeposits,
      recentWithdrawals,
    });
  } catch (err) { return next(err); }
});

// ── Deposits Management ──────────────────────────────────────
router.get('/deposits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.OR = [
      { referenceNumber: { contains: search, mode: 'insensitive' } },
      { user: { username: { contains: search, mode: 'insensitive' } } },
    ];

    const [deposits, total] = await Promise.all([
      prisma.depositRequest.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, fullName: true, mobileNumber: true } },
          paymentAccount: { select: { bankName: true, branch: true } },
        },
      }),
      prisma.depositRequest.count({ where }),
    ]);

    return paginatedResponse(res, deposits, total, page, limit);
  } catch (err) { return next(err); }
});

router.post('/deposits/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await depositsService.approve(req.params.id as string, req.user!.userId, req.ip);
    return successResponse(res, result);
  } catch (err) { return next(err); }
});

router.post('/deposits/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    if (!reason) return errorResponse(res, 'MISSING_REASON', 'Rejection reason is required', 422);
    const result = await depositsService.reject(req.params.id as string, req.user!.userId, reason, req.ip);
    return successResponse(res, result);
  } catch (err) { return next(err); }
});

// ── Withdrawals Management ───────────────────────────────────
router.get('/withdrawals', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.OR = [
      { referenceNumber: { contains: search, mode: 'insensitive' } },
      { user: { username: { contains: search, mode: 'insensitive' } } },
    ];

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawalRequest.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true, fullName: true, mobileNumber: true } } },
        // Never expose accountNumberEncrypted
      }),
      prisma.withdrawalRequest.count({ where }),
    ]);

    // Strip sensitive data
    const safe = withdrawals.map(({ accountNumberEncrypted: _enc, ...w }) => w);
    return paginatedResponse(res, safe, total, page, limit);
  } catch (err) { return next(err); }
});

router.post('/withdrawals/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await withdrawalsService.approve(req.params.id as string, req.user!.userId, req.ip);
    return successResponse(res, result);
  } catch (err) { return next(err); }
});

router.post('/withdrawals/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    if (!reason) return errorResponse(res, 'MISSING_REASON', 'Rejection reason is required', 422);
    const result = await withdrawalsService.reject(req.params.id as string, req.user!.userId, reason, req.ip);
    return successResponse(res, result);
  } catch (err) { return next(err); }
});

// ── Customer Management ──────────────────────────────────────
router.get('/customers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const where: Record<string, unknown> = { role: 'CUSTOMER' };
    if (search) where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } },
      { mobileNumber: { contains: search, mode: 'insensitive' } },
    ];

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        select: {
          id: true, username: true, fullName: true, mobileNumber: true,
          email: true, walletBalance: true, pendingBalance: true,
          isActive: true, createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return paginatedResponse(res, customers, total, page, limit);
  } catch (err) { return next(err); }
});

router.patch('/customers/:id/toggle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { isActive: req.body.isActive },
      select: { id: true, username: true, isActive: true },
    });
    return successResponse(res, user);
  } catch (err) { return next(err); }
});

// ── Promo Codes ──────────────────────────────────────────────
router.get('/promos', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse(res, promos);
  } catch (err) { return next(err); }
});

const promoSchema = z.object({
  code: z.string().min(2).max(20).toUpperCase(),
  bonusPercentage: z.coerce.number().min(0).max(10000),
  description: z.string().optional(),
  termsConditions: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  usageLimit: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
});

router.post('/promos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = promoSchema.safeParse(req.body);
    if (!parsed.success) return errorResponse(res, 'VALIDATION_ERROR', parsed.error.errors[0].message, 422);
    const promo = await prisma.promoCode.create({ data: parsed.data });
    return successResponse(res, promo, 201);
  } catch (err) { return next(err); }
});

router.put('/promos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const promo = await prisma.promoCode.update({ where: { id: req.params.id as string }, data: req.body });
    return successResponse(res, promo);
  } catch (err) { return next(err); }
});

// ── Audit Logs ──────────────────────────────────────────────
router.get('/audit-logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await auditService.getLogs({
      page, limit,
      entityType: req.query.entityType as string,
      action: req.query.action as string,
    });
    return paginatedResponse(res, result.logs, result.total, page, limit);
  } catch (err) { return next(err); }
});

// ── System Settings ──────────────────────────────────────────
router.get('/settings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.systemSetting.findMany({ orderBy: { group: 'asc' } });
    return successResponse(res, settings);
  } catch (err) { return next(err); }
});

router.put('/settings/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.params.key as string;
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value: req.body.value },
      create: { key, value: req.body.value, label: req.body.label, group: req.body.group || 'general' },
    });
    return successResponse(res, setting);
  } catch (err) { return next(err); }
});

export default router;

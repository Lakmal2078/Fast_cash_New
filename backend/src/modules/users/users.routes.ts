import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { successResponse } from '../../utils/response';

const router = Router();

router.get('/dashboard', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const [user, deposits, withdrawals, recentTx] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true, pendingBalance: true, fullName: true, username: true },
      }),
      prisma.depositRequest.aggregate({
        where: { userId },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.withdrawalRequest.aggregate({
        where: { userId },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.depositRequest.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, referenceNumber: true, amount: true, status: true, createdAt: true,
        },
      }),
    ]);

    const recentWithdrawals = await prisma.withdrawalRequest.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, referenceNumber: true, amount: true, status: true, createdAt: true,
      },
    });

    const allTx = [
      ...recentTx.map(d => ({ ...d, type: 'DEPOSIT' as const })),
      ...recentWithdrawals.map(w => ({ ...w, type: 'WITHDRAWAL' as const })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8);

    return successResponse(res, {
      walletBalance: user?.walletBalance || 0,
      pendingBalance: user?.pendingBalance || 0,
      totalDeposits: deposits._sum.amount || 0,
      totalWithdrawals: withdrawals._sum.amount || 0,
      depositCount: deposits._count.id,
      withdrawalCount: withdrawals._count.id,
      recentTransactions: allTx,
    });
  } catch (err) { return next(err); }
});

export default router;

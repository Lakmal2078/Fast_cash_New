import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import { successResponse } from '../../utils/response';

const router = Router();

// Public landing page data
router.get('/landing', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [promos, tickers, contacts, recentTx] = await Promise.all([
      prisma.promoCode.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { code: true, bonusPercentage: true, description: true },
      }),
      prisma.tickerMessage.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { message: true, icon: true },
      }),
      prisma.contactSetting.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { name: true, role: true, phone: true, whatsapp: true },
      }),
      // Show only masked/safe transaction data publicly
      prisma.depositRequest.findMany({
        where: { status: 'APPROVED' },
        take: 6,
        orderBy: { updatedAt: 'desc' },
        select: {
          amount: true,
          updatedAt: true,
          user: { select: { username: true } },
        },
      }),
    ]);

    // Mask usernames for public display
    const safeTx = recentTx.map(tx => ({
      username: tx.user.username.slice(0, 3) + '***',
      amount: tx.amount,
      time: tx.updatedAt,
      type: 'DEPOSIT',
      status: 'Completed',
    }));

    return successResponse(res, {
      promo: promos[0] || null,
      tickers,
      contacts,
      recentTransactions: safeTx,
    });
  } catch (err) { return next(err); }
});

export default router;

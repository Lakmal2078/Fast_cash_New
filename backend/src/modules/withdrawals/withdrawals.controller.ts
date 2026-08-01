import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { withdrawalsService } from './withdrawals.service';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response';

const createWithdrawalSchema = z.object({
  amount: z.coerce.number().min(1000).max(200000),
  bankName: z.string().min(1).max(100),
  accountHolder: z.string().min(1).max(100),
  accountNumber: z.string().min(4).max(30),
  branch: z.string().max(100).optional(),
  note: z.string().max(500).optional(),
});

export const withdrawalsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const idempotencyKey = req.headers['idempotency-key'] as string;
      if (!idempotencyKey) {
        return errorResponse(res, 'MISSING_IDEMPOTENCY_KEY', 'Idempotency-Key header is required', 422);
      }

      const parsed = createWithdrawalSchema.safeParse(req.body);
      if (!parsed.success) {
        return errorResponse(res, 'VALIDATION_ERROR', parsed.error.errors[0].message, 422);
      }

      const withdrawal = await withdrawalsService.create(
        { ...parsed.data, userId: req.user!.userId, idempotencyKey },
        req.ip
      );
      return successResponse(res, withdrawal, 201);
    } catch (err) {
      return next(err);
    }
  },

  async getMyWithdrawals(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await withdrawalsService.getUserWithdrawals(req.user!.userId, page, limit, status);
      return paginatedResponse(res, result.withdrawals, result.total, page, limit);
    } catch (err) {
      return next(err);
    }
  },
};

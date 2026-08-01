import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { paymentsService } from './payments.service';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response';

const createAccountSchema = z.object({
  bankName: z.string().min(1).max(100),
  branch: z.string().min(1).max(100),
  accountNumber: z.string().min(4).max(30),
  accountHolder: z.string().min(1).max(100),
  paymentMethod: z.string().optional(),
  displayOrder: z.coerce.number().optional(),
});

export const paymentsController = {
  async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      const accounts = await paymentsService.getActive();
      return successResponse(res, accounts);
    } catch (err) {
      return next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await paymentsService.getAll(page, limit);
      return paginatedResponse(res, result.accounts, result.total, page, limit);
    } catch (err) {
      return next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createAccountSchema.safeParse(req.body);
      if (!parsed.success) {
        return errorResponse(res, 'VALIDATION_ERROR', parsed.error.errors[0].message, 422);
      }
      const account = await paymentsService.create(parsed.data);
      return successResponse(res, account, 201);
    } catch (err) {
      return next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await paymentsService.update(req.params.id as string, req.body);
      return successResponse(res, account);
    } catch (err) {
      return next(err);
    }
  },

  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await paymentsService.update(req.params.id as string, { isActive: req.body.isActive });
      return successResponse(res, account);
    } catch (err) {
      return next(err);
    }
  },
};

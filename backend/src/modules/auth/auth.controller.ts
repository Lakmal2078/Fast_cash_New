import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema } from './auth.schemas';
import { successResponse, errorResponse } from '../../utils/response';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return errorResponse(res, 'VALIDATION_ERROR', parsed.error.errors[0].message, 422);
      }

      const result = await authService.register(parsed.data, req.ip);
      return successResponse(res, result, 201);
    } catch (err) {
      return next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return errorResponse(res, 'VALIDATION_ERROR', parsed.error.errors[0].message, 422);
      }

      const result = await authService.login(parsed.data, req.ip);
      return successResponse(res, result);
    } catch (err) {
      return next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.user!.userId);
      return successResponse(res, user);
    } catch (err) {
      return next(err);
    }
  },
};

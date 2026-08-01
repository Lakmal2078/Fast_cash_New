import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { depositsService } from './deposits.service';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

const createDepositSchema = z.object({
  amount: z.coerce.number().min(500).max(500000),
  paymentAccountId: z.string().min(1),
  receiptUrl: z.string().optional(),
  receiptKey: z.string().optional(),
  note: z.string().max(500).optional(),
});

export const depositsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const idempotencyKey = req.headers['idempotency-key'] as string;
      if (!idempotencyKey) {
        return errorResponse(res, 'MISSING_IDEMPOTENCY_KEY', 'Idempotency-Key header is required', 422);
      }

      const parsed = createDepositSchema.safeParse(req.body);
      if (!parsed.success) {
        return errorResponse(res, 'VALIDATION_ERROR', parsed.error.errors[0].message, 422);
      }

      const deposit = await depositsService.create(
        { ...parsed.data, userId: req.user!.userId, idempotencyKey },
        req.ip
      );
      return successResponse(res, deposit, 201);
    } catch (err) {
      return next(err);
    }
  },

  async getMyDeposits(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await depositsService.getUserDeposits(req.user!.userId, page, limit, status);
      return paginatedResponse(res, result.deposits, result.total, page, limit);
    } catch (err) {
      return next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const deposit = await depositsService.getById(req.params.id as string, req.user!.userId);
      return successResponse(res, deposit);
    } catch (err) {
      return next(err);
    }
  },

  async getUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename, mimeType } = req.body;
      if (!filename || !mimeType) {
        return errorResponse(res, 'MISSING_FIELDS', 'filename and mimeType are required', 422);
      }
      const result = await depositsService.getUploadUrl(req.user!.userId, filename, mimeType);
      return successResponse(res, result);
    } catch (err) {
      return next(err);
    }
  },

  uploadFile: [
    upload.single('file'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.file) {
          return errorResponse(res, 'NO_FILE', 'No file uploaded', 400);
        }

        const key = decodeURIComponent(req.params.key as string);
        const allowedKeyPattern = /^receipts\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/;
        if (!allowedKeyPattern.test(key)) {
          return errorResponse(res, 'INVALID_KEY', 'Invalid file key', 400);
        }

        const url = await depositsService.saveUploadedFile(key, req.file.buffer);
        return successResponse(res, { url, key });
      } catch (err) {
        return next(err);
      }
    },
  ],
};

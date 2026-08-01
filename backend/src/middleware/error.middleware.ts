import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: Error & { statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Unhandled error:', err.message);

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  // Don't leak internal details in production
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred'
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

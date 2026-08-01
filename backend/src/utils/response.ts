import { Response } from 'express';

export function successResponse(res: Response, data: unknown, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

export function errorResponse(
  res: Response,
  code: string,
  message: string,
  statusCode = 400
) {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

export function paginatedResponse(
  res: Response,
  data: unknown[],
  total: number,
  page: number,
  limit: number
) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

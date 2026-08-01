import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { errorResponse } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse(res, 'UNAUTHORIZED', 'Authentication required', 401);
  }

  const token = authHeader.slice(7);
  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return errorResponse(res, 'INVALID_TOKEN', 'Invalid or expired token', 401);
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'FORBIDDEN', 'Insufficient permissions', 403);
    }
    return next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole('ADMIN', 'SUPER_ADMIN')(req, res, next);
}

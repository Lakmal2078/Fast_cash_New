import { Router, Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';
import { authenticate } from '../../middleware/auth.middleware';
import { successResponse, paginatedResponse } from '../../utils/response';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await notificationsService.getUserNotifications(req.user!.userId, page, limit);
    return paginatedResponse(res, result.notifications, result.total, page, limit);
  } catch (err) { return next(err); }
});

router.patch('/:id/read', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationsService.markRead(req.user!.userId, req.params.id as string);
    return successResponse(res, { message: 'Marked as read' });
  } catch (err) { return next(err); }
});

router.post('/read-all', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationsService.markAllRead(req.user!.userId);
    return successResponse(res, { message: 'All notifications marked as read' });
  } catch (err) { return next(err); }
});

export default router;

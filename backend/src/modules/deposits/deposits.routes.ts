import { Router } from 'express';
import { depositsController } from './deposits.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { uploadRateLimit } from '../../middleware/rate-limit.middleware';

const router = Router();

router.post('/upload-url', authenticate, uploadRateLimit, depositsController.getUploadUrl);
router.put('/upload/:key', authenticate, uploadRateLimit, depositsController.uploadFile);
router.post('/', authenticate, depositsController.create);
router.get('/my', authenticate, depositsController.getMyDeposits);
router.get('/:id', authenticate, depositsController.getOne);

export default router;

import { Router } from 'express';
import { authController } from './auth.controller';
import { authRateLimit } from '../../middleware/rate-limit.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', authRateLimit, authController.register);
router.post('/login', authRateLimit, authController.login);
router.get('/me', authenticate, authController.me);

export default router;

import { Router } from 'express';
import { withdrawalsController } from './withdrawals.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, withdrawalsController.create);
router.get('/my', authenticate, withdrawalsController.getMyWithdrawals);

export default router;

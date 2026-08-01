import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, paymentsController.getActive);
router.get('/all', authenticate, requireAdmin, paymentsController.getAll);
router.post('/', authenticate, requireAdmin, paymentsController.create);
router.put('/:id', authenticate, requireAdmin, paymentsController.update);
router.patch('/:id/toggle', authenticate, requireAdmin, paymentsController.toggle);

export default router;

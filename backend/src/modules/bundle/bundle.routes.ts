import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { bundleController } from './bundle.controller';

const router = Router();

// Public
router.get('/', bundleController.list);

// Authenticated
router.post('/:id/purchase', authenticate, bundleController.purchase);

// Admin
router.get('/admin/all', authenticate, requireAdmin, bundleController.listAll);
router.post('/admin', authenticate, requireAdmin, bundleController.create);
router.put('/admin/:id', authenticate, requireAdmin, bundleController.update);
router.delete('/admin/:id', authenticate, requireAdmin, bundleController.deactivate);

export default router;

import { Router } from 'express';
import { helpController } from './help.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

// Public — any logged-in user can read
router.get('/', authenticate, helpController.getContent);

// Admin only — edit
router.put('/faqs', authenticate, requireAdmin, helpController.updateFaqs);
router.put('/contacts', authenticate, requireAdmin, helpController.updateContacts);
router.put('/tips', authenticate, requireAdmin, helpController.updateTips);

export default router;

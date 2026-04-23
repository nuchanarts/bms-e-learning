import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { ratingController } from './rating.controller';

const router = Router();

// Public
router.get('/:courseId', ratingController.getRatings);

// Authenticated
router.get('/:courseId/my', authenticate, ratingController.getUserRating);
router.post('/:courseId', authenticate, ratingController.submitRating);

// Admin
router.delete('/admin/:id', authenticate, requireAdmin, ratingController.deleteRating);

export default router;

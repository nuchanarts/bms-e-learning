import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { trainingRecordController } from './training-record.controller';

const router = Router();

router.use(authenticate);

router.post('/', trainingRecordController.create);
router.get('/my', trainingRecordController.getMyRecords);
router.get('/:id', trainingRecordController.getById);
router.put('/:id', trainingRecordController.update);
router.delete('/:id', trainingRecordController.delete);

// Admin: view all records for a course (for report)
router.get('/course/:courseId', requireAdmin, trainingRecordController.getByCourse);

export default router;

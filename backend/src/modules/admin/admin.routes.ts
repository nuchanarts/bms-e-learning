import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/analytics', adminController.getAnalytics);

// Courses
router.get('/courses', adminController.getAllCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/reorder', adminController.reorderCourses);
router.put('/courses/:id/featured', adminController.toggleFeatured);
router.put('/courses/:id/require-training-record', adminController.toggleRequireTrainingRecord);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Ratings (admin delete)
router.delete('/ratings/:id', adminController.deleteRating);

// Videos
router.post('/courses/:courseId/videos', adminController.addVideo);
router.put('/videos/:videoId', adminController.updateVideo);
router.delete('/videos/:videoId', adminController.deleteVideo);

// Quiz
router.get('/courses/:courseId/quiz', adminController.getQuizQuestions);
router.post('/courses/:courseId/quiz', adminController.createQuizQuestion);
router.put('/quiz/:questionId', adminController.updateQuizQuestion);
router.delete('/quiz/:questionId', adminController.deleteQuizQuestion);

// Documents
router.post('/courses/:courseId/documents', adminController.addDocument);
router.delete('/documents/:documentId', adminController.deleteDocument);

// Users
router.get('/users', adminController.listUsers);
router.put('/users/:userId/role', adminController.updateUserRole);
router.put('/users/:userId/active', adminController.toggleUserActive);
router.put('/users/:userId/profile', adminController.updateUserProfile);
router.delete('/users/:userId', adminController.deleteUser);

// Export
router.post('/export/sheets', adminController.exportSheets);
router.get('/export/excel', adminController.exportExcel);

// Orders
router.get('/orders', adminController.listOrders);

// Activity Feed
router.get('/activity', adminController.getActivityFeed);

// Announcements
router.get('/announcements', adminController.listAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

// Site Settings
router.get('/settings', adminController.getSiteSettings);
router.put('/settings', adminController.updateSiteSettings);

export default router;

import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { sendAnnouncementSchema, createEventSchema, updateEventSchema } from '../utils/validations';

const router = Router();

// Strict security: Only admins can access these
router.use(authenticate, isAdmin);

router.get('/volunteers', adminController.getVolunteers);
router.patch('/volunteers/:id/toggle-status', adminController.toggleStatus);
router.delete('/volunteers/:id', adminController.deleteUser);

// Event Management
router.post('/events', validate(createEventSchema), adminController.createEvent);
router.patch('/events/:id', validate(updateEventSchema), adminController.updateEvent);
router.delete('/events/:id', adminController.deleteEvent);

// Reports & Announcements
router.get('/reports/volunteers', adminController.getReport);
router.get('/reports/volunteers/csv', adminController.getReportCSV);
router.get('/reports/volunteers/pdf', adminController.getReportPDF);
router.post('/announcements', validate(sendAnnouncementSchema), adminController.sendAnnouncement);

export default router;

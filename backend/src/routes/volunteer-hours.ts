import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createVolunteerHourSchema, reviewVolunteerHourSchema } from '../validators/volunteer-hour';
import * as ctrl from '../controllers/volunteer-hour.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Volunteer creates/lists their hours
router.post('/', validate(createVolunteerHourSchema), ctrl.createVolunteerHour);
router.get('/', ctrl.listMyHours);

// Coordinator/Admin reviews hours
router.patch(
    '/:id/review',
    requireRole('TEACHER', 'ADMIN'),
    validate(reviewVolunteerHourSchema),
    ctrl.reviewHour,
);

export { router as volunteerHoursRouter };

import { Router } from 'express';
import { logHours, getUserHours, getPendingHours, updateHourStatus, getUserStats, getCertificate } from '../controllers/volunteer.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { logVolunteerHourSchema, updateVolunteerHourStatusSchema } from '../utils/validations';
import { UserRole } from '@prisma/client';

const router = Router();

// Gönüllü (Volunteer) routes
router.use(authenticate);

router.get('/my-hours', getUserHours);
router.post('/log-hours', validate(logVolunteerHourSchema), logHours);
router.get('/stats', getUserStats);
router.get('/certificate', getCertificate);

// Koordinatör (Coordinator) & Admin routes
router.get('/pending-hours', requireRole(UserRole.COORDINATOR, UserRole.ADMIN), getPendingHours);
router.patch('/approve-hours/:id', requireRole(UserRole.COORDINATOR, UserRole.ADMIN), validate(updateVolunteerHourStatusSchema), updateHourStatus);

export default router;

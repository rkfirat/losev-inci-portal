import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth';
import * as ctrl from '../controllers/teacher.controller';

const router = Router();

router.use(authenticate);
router.use(requireRole('TEACHER', 'ADMIN'));

router.get('/dashboard', ctrl.getTeacherDashboard);
router.get('/pending-reviews', ctrl.getPendingReviews);

export { router as teacherRouter };

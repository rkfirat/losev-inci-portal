import { Router } from 'express';
import authRoutes from './auth.routes';
import volunteerRoutes from './volunteer.routes';
import dashboardRoutes from './dashboard.routes';
import badgeRoutes from './badge.routes';
import eventRoutes from './event.routes';
import leaderboardRoutes from './leaderboard.routes';
import coordinatorRoutes from './coordinator.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/volunteers', volunteerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/badges', badgeRoutes);
router.use('/events', eventRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/coordinator', coordinatorRoutes);
router.use('/admin', adminRoutes);

export default router;

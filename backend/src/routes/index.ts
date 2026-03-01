import { Router } from 'express';
import { authRouter } from './auth';
import { volunteerHoursRouter } from './volunteer-hours';
import { badgesRouter } from './badges';
import { eventsRouter } from './events';
import { leaderboardRouter } from './leaderboard';
import { dashboardRouter } from './dashboard';
import { teacherRouter } from './teacher';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRouter);
router.use('/dashboard', dashboardRouter);
router.use('/volunteer-hours', volunteerHoursRouter);
router.use('/badges', badgesRouter);
router.use('/events', eventsRouter);
router.use('/leaderboard', leaderboardRouter);
router.use('/teacher', teacherRouter);

export { router };

import { Router } from 'express';
import leaderboardController from '../controllers/leaderboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Protected routes
router.use(authenticate);

router.get('/volunteers', leaderboardController.getTopVolunteers);
router.get('/teams', leaderboardController.getTeamLeaderboard);

export default router;

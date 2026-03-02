import { Request, Response } from 'express';
import leaderboardService from '../services/leaderboard.service';
import logger from '../utils/logger';

export class LeaderboardController {
  async getTopVolunteers(req: Request, res: Response) {
    try {
      const leaderboard = await leaderboardService.getTopVolunteers();
      res.json({
        success: true,
        data: leaderboard,
      });
    } catch (error) {
      logger.error('LeaderboardController getTopVolunteers error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch leaderboard' },
      });
    }
  }

  async getTeamLeaderboard(req: Request, res: Response) {
    try {
      const leaderboard = await leaderboardService.getTeamLeaderboard();
      res.json({
        success: true,
        data: leaderboard,
      });
    } catch (error) {
      logger.error('LeaderboardController getTeamLeaderboard error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch team leaderboard' },
      });
    }
  }
}

export default new LeaderboardController();

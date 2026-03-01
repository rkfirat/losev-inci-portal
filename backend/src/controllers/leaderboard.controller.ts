import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as leaderboardService from '../services/leaderboard.service';

export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const period = (req.query.period as 'weekly' | 'monthly' | 'all') || 'monthly';
    const result = await leaderboardService.getLeaderboard(period, req.user?.userId);
    res.json({ status: 'success', data: result });
});

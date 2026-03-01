import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as dashboardService from '../services/dashboard.service';

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const result = await dashboardService.getDashboard(req.user!.userId);
    res.json({ status: 'success', data: result });
});

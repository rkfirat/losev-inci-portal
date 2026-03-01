import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as teacherService from '../services/teacher.service';

export const getTeacherDashboard = asyncHandler(async (req: Request, res: Response) => {
    const data = await teacherService.getTeacherDashboard(req.user!.id);
    res.json({ status: 'success', data });
});

export const getPendingReviews = asyncHandler(async (req: Request, res: Response) => {
    const data = await teacherService.getPendingReviews(req.user!.id);
    res.json({ status: 'success', data });
});

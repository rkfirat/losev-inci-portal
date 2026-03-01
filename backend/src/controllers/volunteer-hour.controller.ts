import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as volunteerHourService from '../services/volunteer-hour.service';

export const createVolunteerHour = asyncHandler(async (req: Request, res: Response) => {
    const hour = await volunteerHourService.createVolunteerHour(req.user!.id, req.body);
    res.status(201).json({ status: 'success', data: hour });
});

export const listMyHours = asyncHandler(async (req: Request, res: Response) => {
    const result = await volunteerHourService.listVolunteerHours(req.user!.id, req.query as any);
    res.json({ status: 'success', data: result });
});

export const reviewHour = asyncHandler(async (req: Request, res: Response) => {
    const result = await volunteerHourService.reviewVolunteerHour(
        req.user!.id,
        req.params.id,
        req.body.status,
        req.body.reviewNote,
    );
    res.json({ status: 'success', data: result });
});

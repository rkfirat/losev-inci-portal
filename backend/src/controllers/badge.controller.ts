import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as badgeService from '../services/badge.service';

export const listBadges = asyncHandler(async (req: Request, res: Response) => {
    const badges = await badgeService.listBadges(req.user!.id);
    res.json({ status: 'success', data: badges });
});

export const getBadgeDetail = asyncHandler(async (req: Request, res: Response) => {
    const badge = await badgeService.getBadgeDetail(req.params.id, req.user!.id);
    res.json({ status: 'success', data: badge });
});

export const getMyBadges = asyncHandler(async (req: Request, res: Response) => {
    const badges = await badgeService.getMyBadges(req.user!.id);
    res.json({ status: 'success', data: badges });
});

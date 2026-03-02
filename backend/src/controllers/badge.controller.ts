import { Response, NextFunction } from 'express';
import { BadgeService } from '../services/badge.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAllBadges = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const badges = await BadgeService.getAllBadges();
    res.status(200).json({
      success: true,
      data: badges,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBadges = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const userBadges = await BadgeService.getUserBadges(userId);
    res.status(200).json({
      success: true,
      data: userBadges.map(ub => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

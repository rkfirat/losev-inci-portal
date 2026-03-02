"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBadges = exports.getAllBadges = void 0;
const badge_service_1 = require("../services/badge.service");
const getAllBadges = async (req, res, next) => {
    try {
        const badges = await badge_service_1.BadgeService.getAllBadges();
        res.status(200).json({
            success: true,
            data: badges,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllBadges = getAllBadges;
const getUserBadges = async (req, res, next) => {
    try {
        const userId = req.user.sub;
        const userBadges = await badge_service_1.BadgeService.getUserBadges(userId);
        res.status(200).json({
            success: true,
            data: userBadges.map(ub => ({
                ...ub.badge,
                earnedAt: ub.earnedAt,
            })),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserBadges = getUserBadges;

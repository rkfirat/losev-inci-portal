"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeService = void 0;
const database_1 = __importDefault(require("../config/database"));
const notification_service_1 = require("./notification.service");
class BadgeService {
    static async getAllBadges() {
        return database_1.default.badge.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
    }
    static async getUserBadges(userId) {
        return database_1.default.volunteerBadge.findMany({
            where: { userId },
            include: {
                badge: true,
            },
            orderBy: { earnedAt: 'desc' },
        });
    }
    static async checkAndAwardBadges(userId) {
        // This will be called after approving hours or attending events
        // For MVP, we can check basic "total hours" badges
        const approvedHoursAgg = await database_1.default.volunteerHour.aggregate({
            where: {
                userId,
                status: 'APPROVED',
            },
            _sum: {
                hours: true,
            },
        });
        const totalHours = Number(approvedHoursAgg._sum.hours || 0);
        // Get all potential hour-based badges that the user doesn't have yet
        const earnedBadgeIds = (await database_1.default.volunteerBadge.findMany({
            where: { userId },
            select: { badgeId: true },
        })).map(b => b.badgeId);
        const availableBadges = await database_1.default.badge.findMany({
            where: {
                isActive: true,
                category: 'hours',
                id: { notIn: earnedBadgeIds },
            },
        });
        const newBadges = [];
        for (const badge of availableBadges) {
            const criteria = badge.criteria;
            if (criteria && criteria.type === 'hours' && totalHours >= criteria.threshold) {
                // Award badge
                const newBadge = await database_1.default.volunteerBadge.create({
                    data: {
                        userId,
                        badgeId: badge.id,
                    },
                    include: { badge: true },
                });
                // Notify User
                await notification_service_1.NotificationService.notifyUser(userId, 'Yeni Rozet Kazandınız! 🏅', `Tebrikler, "${badge.name}" rozetini kazandınız!`, { type: 'BADGE_EARNED', id: badge.id, name: badge.name });
                // Invalidate leaderboard cache since badge count changed
                const leaderboardService = require('./leaderboard.service').default;
                if (leaderboardService) {
                    await leaderboardService.constructor.invalidateCache();
                }
                newBadges.push(newBadge.badge);
            }
        }
        return newBadges;
    }
}
exports.BadgeService = BadgeService;

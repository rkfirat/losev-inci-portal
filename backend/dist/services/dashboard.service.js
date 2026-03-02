"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const database_1 = __importDefault(require("../config/database"));
const client_1 = require("@prisma/client");
class DashboardService {
    static async getDashboardData(userId, userRole) {
        // 1. Total Stats
        const approvedHoursAgg = await database_1.default.volunteerHour.aggregate({
            where: {
                userId,
                status: client_1.HourStatus.APPROVED,
            },
            _sum: {
                hours: true,
            },
        });
        const totalBadges = await database_1.default.volunteerBadge.count({
            where: { userId },
        });
        // 2. Weekly Hours (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weeklyHours = await database_1.default.volunteerHour.findMany({
            where: {
                userId,
                status: client_1.HourStatus.APPROVED,
                date: { gte: sevenDaysAgo },
            },
            select: {
                hours: true,
                date: true,
            },
            orderBy: { date: 'asc' },
        });
        // 3. Recently Earned Badges
        const recentBadges = await database_1.default.volunteerBadge.findMany({
            where: { userId },
            include: {
                badge: true,
            },
            orderBy: { earnedAt: 'desc' },
            take: 3,
        });
        // 4. Upcoming Events
        const upcomingEvents = await database_1.default.eventParticipant.findMany({
            where: {
                userId,
                event: {
                    startDate: { gte: new Date() },
                    isActive: true,
                },
            },
            include: {
                event: true,
            },
            orderBy: {
                event: { startDate: 'asc' },
            },
            take: 2,
        });
        // 5. Leaderboard Rank (Simple version)
        const leaderboard = await database_1.default.volunteerHour.groupBy({
            by: ['userId'],
            where: { status: client_1.HourStatus.APPROVED },
            _sum: { hours: true },
            orderBy: { _sum: { hours: 'desc' } },
        });
        const rank = leaderboard.findIndex(item => item.userId === userId) + 1;
        // 6. Announcements
        const announcements = await database_1.default.announcement.findMany({
            where: {
                OR: [
                    { targetRole: null },
                    { targetRole: userRole },
                ],
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        return {
            stats: {
                totalHours: Number(approvedHoursAgg._sum.hours || 0),
                badgeCount: totalBadges,
                rank: rank > 0 ? rank : null,
            },
            weeklyHours,
            recentBadges: recentBadges.map(vb => vb.badge),
            upcomingEvents: upcomingEvents.map(ep => ep.event),
            announcements,
        };
    }
    static async getAdminStats() {
        const [pendingHoursCount, activeVolunteersCount, activeEventsCount, totalSystemHoursAgg, totalBadgesAwarded] = await Promise.all([
            database_1.default.volunteerHour.count({ where: { status: client_1.HourStatus.PENDING } }),
            database_1.default.user.count({ where: { role: client_1.UserRole.VOLUNTEER, isActive: true } }),
            database_1.default.event.count({ where: { isActive: true, startDate: { gte: new Date() } } }),
            database_1.default.volunteerHour.aggregate({
                where: { status: client_1.HourStatus.APPROVED },
                _sum: { hours: true },
            }),
            database_1.default.volunteerBadge.count(),
        ]);
        return {
            pendingHoursCount,
            activeVolunteersCount,
            activeEventsCount,
            totalSystemHours: Number(totalSystemHoursAgg._sum.hours || 0),
            totalBadgesAwarded,
        };
    }
}
exports.DashboardService = DashboardService;

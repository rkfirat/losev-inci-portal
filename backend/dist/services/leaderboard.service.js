"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardService = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const logger_1 = __importDefault(require("../utils/logger"));
const database_1 = __importDefault(require("../config/database"));
class LeaderboardService {
    static CACHE_KEY = 'leaderboard:top100';
    static TEAM_CACHE_KEY = 'leaderboard:teams';
    static CACHE_EXPIRY = 60 * 5; // 5 minutes
    async getTopVolunteers() {
        try {
            if (redis_1.default && redis_1.default.status === 'ready') {
                const cachedData = await redis_1.default.get(LeaderboardService.CACHE_KEY);
                if (cachedData)
                    return JSON.parse(cachedData);
            }
            const leaderboard = await database_1.default.user.findMany({
                where: { role: 'VOLUNTEER', isActive: true },
                select: {
                    id: true, firstName: true, lastName: true, avatarUrl: true, school: true,
                    _count: { select: { volunteerBadges: true } },
                    volunteerHours: { where: { status: 'APPROVED' }, select: { hours: true } },
                },
            });
            const mappedLeaderboard = leaderboard
                .map((user) => {
                const totalHours = user.volunteerHours.reduce((sum, entry) => sum + Number(entry.hours), 0);
                return {
                    id: user.id, firstName: user.firstName, lastName: user.lastName,
                    avatarUrl: user.avatarUrl, school: user.school, totalHours,
                    badgeCount: user._count.volunteerBadges,
                };
            })
                .sort((a, b) => b.totalHours - a.totalHours)
                .slice(0, 100);
            if (redis_1.default && redis_1.default.status === 'ready') {
                await redis_1.default.set(LeaderboardService.CACHE_KEY, JSON.stringify(mappedLeaderboard), 'EX', LeaderboardService.CACHE_EXPIRY);
            }
            return mappedLeaderboard;
        }
        catch (error) {
            logger_1.default.error('Error fetching leaderboard:', error);
            throw error;
        }
    }
    async getTeamLeaderboard() {
        try {
            if (redis_1.default && redis_1.default.status === 'ready') {
                const cachedData = await redis_1.default.get(LeaderboardService.TEAM_CACHE_KEY);
                if (cachedData)
                    return JSON.parse(cachedData);
            }
            const coalitions = await database_1.default.coalition.findMany({
                include: {
                    users: {
                        where: { role: 'VOLUNTEER', isActive: true },
                        select: {
                            volunteerHours: { where: { status: 'APPROVED' }, select: { hours: true } },
                        },
                    },
                },
            });
            const mappedTeams = coalitions.map(team => {
                const totalHours = team.users.reduce((teamSum, user) => {
                    return teamSum + user.volunteerHours.reduce((userSum, entry) => userSum + Number(entry.hours), 0);
                }, 0);
                return {
                    id: team.id,
                    name: team.name,
                    color: team.color,
                    imageUrl: team.imageUrl,
                    totalHours,
                    memberCount: team.users.length,
                };
            }).sort((a, b) => b.totalHours - a.totalHours);
            if (redis_1.default && redis_1.default.status === 'ready') {
                await redis_1.default.set(LeaderboardService.TEAM_CACHE_KEY, JSON.stringify(mappedTeams), 'EX', LeaderboardService.CACHE_EXPIRY);
            }
            return mappedTeams;
        }
        catch (error) {
            logger_1.default.error('Error fetching team leaderboard:', error);
            throw error;
        }
    }
    async getUserRank(userId) {
        const fullLeaderboard = await this.getTopVolunteers();
        const rank = fullLeaderboard.findIndex((u) => u.id === userId) + 1;
        return rank > 0 ? rank : null;
    }
    static async invalidateCache() {
        if (redis_1.default && redis_1.default.status === 'ready') {
            await redis_1.default.del(LeaderboardService.CACHE_KEY).catch(() => { });
            await redis_1.default.del(LeaderboardService.TEAM_CACHE_KEY).catch(() => { });
        }
    }
}
exports.LeaderboardService = LeaderboardService;
exports.default = new LeaderboardService();

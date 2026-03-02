import redis from '../config/redis';
import logger from '../utils/logger';
import prisma from '../config/database';

export class LeaderboardService {
  private static CACHE_KEY = 'leaderboard:top100';
  private static TEAM_CACHE_KEY = 'leaderboard:teams';
  private static CACHE_EXPIRY = 60 * 5; // 5 minutes

  async getTopVolunteers() {
    try {
      if (redis && redis.status === 'ready') {
        const cachedData = await redis.get(LeaderboardService.CACHE_KEY);
        if (cachedData) return JSON.parse(cachedData);
      }

      const leaderboard = await prisma.user.findMany({
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

      if (redis && redis.status === 'ready') {
        await redis.set(LeaderboardService.CACHE_KEY, JSON.stringify(mappedLeaderboard), 'EX', LeaderboardService.CACHE_EXPIRY);
      }
      return mappedLeaderboard;
    } catch (error) {
      logger.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  async getTeamLeaderboard() {
    try {
      if (redis && redis.status === 'ready') {
        const cachedData = await redis.get(LeaderboardService.TEAM_CACHE_KEY);
        if (cachedData) return JSON.parse(cachedData);
      }

      const coalitions = await prisma.coalition.findMany({
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

      if (redis && redis.status === 'ready') {
        await redis.set(LeaderboardService.TEAM_CACHE_KEY, JSON.stringify(mappedTeams), 'EX', LeaderboardService.CACHE_EXPIRY);
      }
      return mappedTeams;
    } catch (error) {
      logger.error('Error fetching team leaderboard:', error);
      throw error;
    }
  }

  async getUserRank(userId: string) {
    const fullLeaderboard = await this.getTopVolunteers();
    const rank = fullLeaderboard.findIndex((u: any) => u.id === userId) + 1;
    return rank > 0 ? rank : null;
  }

  static async invalidateCache() {
    if (redis && redis.status === 'ready') {
      await redis.del(LeaderboardService.CACHE_KEY).catch(() => {});
      await redis.del(LeaderboardService.TEAM_CACHE_KEY).catch(() => {});
    }
  }
}

export default new LeaderboardService();

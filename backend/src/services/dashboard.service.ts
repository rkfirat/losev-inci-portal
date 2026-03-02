import prisma from '../config/database';
import { HourStatus, UserRole } from '@prisma/client';

export class DashboardService {
  static async getDashboardData(userId: string, userRole: UserRole) {
    // 1. Total Stats
    const approvedHoursAgg = await prisma.volunteerHour.aggregate({
      where: {
        userId,
        status: HourStatus.APPROVED,
      },
      _sum: {
        hours: true,
      },
    });

    const totalBadges = await prisma.volunteerBadge.count({
      where: { userId },
    });

    // 2. Weekly Hours (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyHours = await prisma.volunteerHour.findMany({
      where: {
        userId,
        status: HourStatus.APPROVED,
        date: { gte: sevenDaysAgo },
      },
      select: {
        hours: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });

    // 3. Recently Earned Badges
    const recentBadges = await prisma.volunteerBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
      take: 3,
    });

    // 4. Upcoming Events
    const upcomingEvents = await prisma.eventParticipant.findMany({
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
    const leaderboard = await prisma.volunteerHour.groupBy({
      by: ['userId'],
      where: { status: HourStatus.APPROVED },
      _sum: { hours: true },
      orderBy: { _sum: { hours: 'desc' } },
    });

    const rank = leaderboard.findIndex(item => item.userId === userId) + 1;

    // 6. Announcements
    const announcements = await prisma.announcement.findMany({
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
    const [
      pendingHoursCount, 
      activeVolunteersCount, 
      activeEventsCount,
      totalSystemHoursAgg,
      totalBadgesAwarded
    ] = await Promise.all([
      prisma.volunteerHour.count({ where: { status: HourStatus.PENDING } }),
      prisma.user.count({ where: { role: UserRole.VOLUNTEER, isActive: true } }),
      prisma.event.count({ where: { isActive: true, startDate: { gte: new Date() } } }),
      prisma.volunteerHour.aggregate({
        where: { status: HourStatus.APPROVED },
        _sum: { hours: true },
      }),
      prisma.volunteerBadge.count(),
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

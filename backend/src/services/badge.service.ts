import prisma from '../config/database';
import { NotificationService } from './notification.service';

export class BadgeService {
  static async getAllBadges() {
    return prisma.badge.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  static async getUserBadges(userId: string) {
    return prisma.volunteerBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    });
  }

  static async checkAndAwardBadges(userId: string) {
    // This will be called after approving hours or attending events
    // For MVP, we can check basic "total hours" badges
    const approvedHoursAgg = await prisma.volunteerHour.aggregate({
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
    const earnedBadgeIds = (await prisma.volunteerBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    })).map(b => b.badgeId);

    const availableBadges = await prisma.badge.findMany({
      where: {
        isActive: true,
        category: 'hours',
        id: { notIn: earnedBadgeIds },
      },
    });

    const newBadges = [];

    for (const badge of availableBadges) {
      const criteria = badge.criteria as any;
      if (criteria && criteria.type === 'hours' && totalHours >= criteria.threshold) {
        // Award badge
        const newBadge = await prisma.volunteerBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
          include: { badge: true },
        });
        
        // Notify User
        await NotificationService.notifyUser(
          userId,
          'Yeni Rozet Kazandınız! 🏅',
          `Tebrikler, "${badge.name}" rozetini kazandınız!`,
          { type: 'BADGE_EARNED', id: badge.id, name: badge.name }
        );

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

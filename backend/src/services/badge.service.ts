import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export async function listBadges(userId: string) {
    const badges = await prisma.badge.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
    });

    const earned = await prisma.volunteerBadge.findMany({
        where: { userId },
        select: { badgeId: true, earnedAt: true },
    });

    const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));

    return badges.map((badge) => ({
        ...badge,
        earned: earnedMap.has(badge.id),
        earnedAt: earnedMap.get(badge.id) || null,
    }));
}

export async function getBadgeDetail(badgeId: string, userId: string) {
    const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge) throw new NotFoundError('Badge not found');

    const volunteerBadge = await prisma.volunteerBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId } },
    });

    // Calculate progress
    const criteria = badge.criteria as { type: string; threshold: number };
    let progress = 0;

    switch (criteria.type) {
        case 'hours_logged': {
            const count = await prisma.volunteerHour.count({
                where: { userId, deletedAt: null },
            });
            progress = count;
            break;
        }
        case 'hours_approved': {
            const sum = await prisma.volunteerHour.aggregate({
                where: { userId, status: 'APPROVED', deletedAt: null },
                _sum: { hours: true },
            });
            progress = Number(sum._sum.hours || 0);
            break;
        }
        case 'events_participated': {
            const count = await prisma.eventParticipant.count({ where: { userId } });
            progress = count;
            break;
        }
    }

    return {
        ...badge,
        earned: !!volunteerBadge,
        earnedAt: volunteerBadge?.earnedAt || null,
        progress,
        threshold: criteria.threshold,
        progressPercent: Math.min(100, Math.round((progress / criteria.threshold) * 100)),
    };
}

export async function getMyBadges(userId: string) {
    const earned = await prisma.volunteerBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
    });

    return earned.map((vb) => ({
        ...vb.badge,
        earnedAt: vb.earnedAt,
    }));
}

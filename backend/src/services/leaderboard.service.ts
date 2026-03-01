import { prisma } from '../config/database';

type Period = 'weekly' | 'monthly' | 'all';

export async function getLeaderboard(period: Period = 'monthly', userId?: string) {
    const now = new Date();
    let dateFilter: Date | undefined;

    if (period === 'weekly') {
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'monthly') {
        dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const whereClause: Record<string, unknown> = {
        status: 'APPROVED',
        deletedAt: null,
    };
    if (dateFilter) {
        whereClause.date = { gte: dateFilter };
    }

    const leaderboard = await prisma.volunteerHour.groupBy({
        by: ['userId'],
        where: whereClause,
        _sum: { hours: true },
        orderBy: { _sum: { hours: 'desc' } },
        take: 50,
    });

    const userIds = leaderboard.map((e) => e.userId);
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true, avatarUrl: true, school: true },
    });

    const badgeCounts = await prisma.volunteerBadge.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _count: true,
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    const badgeMap = new Map(badgeCounts.map((b) => [b.userId, b._count]));

    const entries = leaderboard.map((entry, index) => {
        const user = userMap.get(entry.userId);
        return {
            rank: index + 1,
            userId: entry.userId,
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            avatarUrl: user?.avatarUrl || null,
            school: user?.school || null,
            totalHours: Number(entry._sum.hours || 0),
            badgeCount: badgeMap.get(entry.userId) || 0,
        };
    });

    // Find current user's position if not in top 50
    let currentUserRank = null;
    if (userId) {
        const userEntry = entries.find((e) => e.userId === userId);
        if (userEntry) {
            currentUserRank = userEntry;
        } else {
            const userTotal = await prisma.volunteerHour.aggregate({
                where: { ...whereClause, userId },
                _sum: { hours: true },
            });
            const userHours = Number(userTotal._sum.hours || 0);
            if (userHours > 0) {
                const aboveCount = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
                    `SELECT COUNT(DISTINCT user_id) as count FROM volunteer_hours WHERE status = 'APPROVED' AND deleted_at IS NULL ${dateFilter ? `AND date >= '${dateFilter.toISOString()}'` : ''} GROUP BY user_id HAVING SUM(hours) > ${userHours}`,
                );
                const rank = Number(aboveCount?.[0]?.count || 0) + 1;
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { firstName: true, lastName: true, avatarUrl: true },
                });
                const badges = await prisma.volunteerBadge.count({ where: { userId } });
                currentUserRank = {
                    rank,
                    userId,
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    avatarUrl: user?.avatarUrl || null,
                    totalHours: userHours,
                    badgeCount: badges,
                };
            }
        }
    }

    return { entries, currentUserRank, period };
}

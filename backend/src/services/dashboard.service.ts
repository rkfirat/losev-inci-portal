import { prisma } from '../config/database';

export async function getDashboard(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Total approved hours
    const totalHours = await prisma.volunteerHour.aggregate({
        where: { userId, status: 'APPROVED', deletedAt: null },
        _sum: { hours: true },
    });

    // This month's approved hours
    const monthlyHours = await prisma.volunteerHour.aggregate({
        where: { userId, status: 'APPROVED', deletedAt: null, date: { gte: monthStart } },
        _sum: { hours: true },
    });

    // This year's approved hours
    const yearlyHours = await prisma.volunteerHour.aggregate({
        where: { userId, status: 'APPROVED', deletedAt: null, date: { gte: yearStart } },
        _sum: { hours: true },
    });

    // Pending hours count
    const pendingCount = await prisma.volunteerHour.count({
        where: { userId, status: 'PENDING', deletedAt: null },
    });

    // Recent badges (last 3)
    const recentBadges = await prisma.volunteerBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
        take: 3,
    });

    // Badge counts
    const totalBadges = await prisma.badge.count({ where: { isActive: true } });
    const earnedBadges = await prisma.volunteerBadge.count({ where: { userId } });

    // Upcoming events (next 3)
    const upcomingEvents = await prisma.event.findMany({
        where: { isActive: true, deletedAt: null, date: { gte: now } },
        orderBy: { date: 'asc' },
        take: 3,
        include: { _count: { select: { participants: true } } },
    });

    // User's leaderboard position
    const userHoursVal = Number(totalHours._sum.hours || 0);
    let leaderboardRank = 0;
    if (userHoursVal > 0) {
        const usersAbove = await prisma.volunteerHour.groupBy({
            by: ['userId'],
            where: { status: 'APPROVED', deletedAt: null },
            _sum: { hours: true },
            having: { hours: { _sum: { gt: userHoursVal } } },
        });
        leaderboardRank = usersAbove.length + 1;
    }

    // Activity type distribution (for student's own data)
    const activityDist = await prisma.volunteerHour.groupBy({
        by: ['activityType'],
        where: { userId, status: 'APPROVED', deletedAt: null },
        _sum: { hours: true },
        _count: true,
    });

    const result: Record<string, unknown> = {
        stats: {
            totalHours: Number(totalHours._sum.hours || 0),
            monthlyHours: Number(monthlyHours._sum.hours || 0),
            yearlyHours: Number(yearlyHours._sum.hours || 0),
            targetHours: 40,
            pendingCount,
            earnedBadges,
            totalBadges,
            leaderboardRank,
        },
        recentBadges: recentBadges.map((vb) => ({
            id: vb.badge.id,
            name: vb.badge.name,
            iconUrl: vb.badge.iconUrl,
            earnedAt: vb.earnedAt,
        })),
        upcomingEvents: upcomingEvents.map((e) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            location: e.location,
            participantCount: e._count.participants,
            capacity: e.capacity,
        })),
        activityDistribution: activityDist.map((a) => ({
            type: a.activityType,
            count: a._count,
            hours: Number(a._sum.hours || 0),
        })),
    };

    // Teacher/Admin: add school overview
    if (user && (user.role === 'TEACHER' || user.role === 'ADMIN')) {
        const schoolFilter = user.role === 'TEACHER' && user.school ? { school: user.school } : {};
        const allStudents = await prisma.user.findMany({
            where: { role: 'STUDENT', deletedAt: null, ...schoolFilter },
            select: { id: true },
        });
        const allStudentIds = allStudents.map((s) => s.id);

        const schoolTotalHours = await prisma.volunteerHour.aggregate({
            where: { userId: { in: allStudentIds }, status: 'APPROVED', deletedAt: null },
            _sum: { hours: true },
        });
        const schoolPending = await prisma.volunteerHour.count({
            where: { userId: { in: allStudentIds }, status: 'PENDING', deletedAt: null },
        });

        result.schoolOverview = {
            totalStudents: allStudents.length,
            totalApprovedHours: Number(schoolTotalHours._sum.hours || 0),
            pendingReviews: schoolPending,
        };
    }

    // Admin: add global stats
    if (user && user.role === 'ADMIN') {
        const globalHours = await prisma.volunteerHour.aggregate({
            where: { status: 'APPROVED', deletedAt: null },
            _sum: { hours: true },
        });
        const totalStudents = await prisma.user.count({ where: { role: 'STUDENT', deletedAt: null } });
        const totalSchools = await prisma.user.groupBy({
            by: ['school'],
            where: { role: 'STUDENT', school: { not: null }, deletedAt: null },
        });

        result.globalStats = {
            totalVolunteerHours: Number(globalHours._sum.hours || 0),
            totalStudents,
            totalSchools: totalSchools.length,
        };
    }

    return result;
}

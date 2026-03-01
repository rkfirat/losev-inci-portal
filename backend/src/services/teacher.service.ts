import { prisma } from '../config/database';

export async function getTeacherDashboard(teacherId: string) {
    const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher?.school) return { students: [], schoolStats: null };

    // Students in the same school
    const students = await prisma.user.findMany({
        where: { school: teacher.school, role: 'STUDENT', deletedAt: null },
        select: {
            id: true, firstName: true, lastName: true, grade: true, email: true,
            _count: { select: { volunteerHours: true } },
        },
        orderBy: { firstName: 'asc' },
    });

    // School totals
    const studentIds = students.map((s) => s.id);
    const totalApproved = await prisma.volunteerHour.aggregate({
        where: { userId: { in: studentIds }, status: 'APPROVED', deletedAt: null },
        _sum: { hours: true },
    });
    const pendingCount = await prisma.volunteerHour.count({
        where: { userId: { in: studentIds }, status: 'PENDING', deletedAt: null },
    });

    // Per-student hours
    const studentHours = await Promise.all(
        students.map(async (s) => {
            const approved = await prisma.volunteerHour.aggregate({
                where: { userId: s.id, status: 'APPROVED', deletedAt: null },
                _sum: { hours: true },
            });
            const badges = await prisma.volunteerBadge.count({ where: { userId: s.id } });
            return {
                id: s.id,
                firstName: s.firstName,
                lastName: s.lastName,
                grade: s.grade,
                email: s.email,
                totalHours: Number(approved._sum.hours || 0),
                activityCount: s._count.volunteerHours,
                badgeCount: badges,
            };
        }),
    );

    return {
        school: teacher.school,
        students: studentHours.sort((a, b) => b.totalHours - a.totalHours),
        schoolStats: {
            totalStudents: students.length,
            totalApprovedHours: Number(totalApproved._sum.hours || 0),
            pendingReviews: pendingCount,
        },
    };
}

export async function getPendingReviews(teacherId: string) {
    const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher?.school) return [];

    const studentIds = (
        await prisma.user.findMany({
            where: { school: teacher.school, role: 'STUDENT', deletedAt: null },
            select: { id: true },
        })
    ).map((s) => s.id);

    return prisma.volunteerHour.findMany({
        where: { userId: { in: studentIds }, status: 'PENDING', deletedAt: null },
        include: {
            user: { select: { firstName: true, lastName: true, grade: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
}

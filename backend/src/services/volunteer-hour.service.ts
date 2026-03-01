import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import type { CreateVolunteerHourInput, ListVolunteerHoursQuery } from '../validators/volunteer-hour';

export async function createVolunteerHour(userId: string, input: CreateVolunteerHourInput) {
    const date = new Date(input.date);
    if (date > new Date()) {
        throw new BadRequestError('Cannot log hours for future dates');
    }

    const hour = await prisma.volunteerHour.create({
        data: {
            userId,
            activityType: input.activityType,
            projectName: input.projectName,
            date,
            hours: input.hours,
            description: input.description || null,
            photoUrl: input.photoUrl || null,
            documentUrl: input.documentUrl || null,
        },
    });

    return hour;
}

export async function listVolunteerHours(userId: string, query: ListVolunteerHoursQuery) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId, deletedAt: null };
    if (status) where.status = status;

    const [hours, total] = await Promise.all([
        prisma.volunteerHour.findMany({
            where,
            orderBy: { date: 'desc' },
            skip,
            take: limit,
        }),
        prisma.volunteerHour.count({ where }),
    ]);

    const totalApproved = await prisma.volunteerHour.aggregate({
        where: { userId, status: 'APPROVED', deletedAt: null },
        _sum: { hours: true },
    });

    return {
        hours,
        totalApprovedHours: Number(totalApproved._sum.hours || 0),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function reviewVolunteerHour(
    reviewerId: string,
    hourId: string,
    status: 'APPROVED' | 'REJECTED',
    reviewNote?: string,
) {
    const hour = await prisma.volunteerHour.findUnique({ where: { id: hourId } });
    if (!hour || hour.deletedAt) throw new NotFoundError('Volunteer hour not found');
    if (hour.status !== 'PENDING') throw new BadRequestError('Only pending hours can be reviewed');

    const updated = await prisma.volunteerHour.update({
        where: { id: hourId },
        data: {
            status,
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            reviewNote: reviewNote || null,
        },
    });

    // If approved, check badge criteria
    if (status === 'APPROVED') {
        await checkAndAwardBadges(hour.userId);
    }

    return updated;
}

async function checkAndAwardBadges(userId: string) {
    const totalApproved = await prisma.volunteerHour.aggregate({
        where: { userId, status: 'APPROVED', deletedAt: null },
        _sum: { hours: true },
    });
    const totalHours = Number(totalApproved._sum.hours || 0);

    const totalLogged = await prisma.volunteerHour.count({
        where: { userId, deletedAt: null },
    });

    const eventCount = await prisma.eventParticipant.count({
        where: { userId },
    });

    const badges = await prisma.badge.findMany({ where: { isActive: true } });
    const existingBadges = await prisma.volunteerBadge.findMany({
        where: { userId },
        select: { badgeId: true },
    });
    const earnedIds = new Set(existingBadges.map((b) => b.badgeId));

    const newBadges: string[] = [];

    for (const badge of badges) {
        if (earnedIds.has(badge.id)) continue;

        const criteria = badge.criteria as { type: string; threshold: number };
        let earned = false;

        switch (criteria.type) {
            case 'hours_logged':
                earned = totalLogged >= criteria.threshold;
                break;
            case 'hours_approved':
                earned = totalHours >= criteria.threshold;
                break;
            case 'events_participated':
                earned = eventCount >= criteria.threshold;
                break;
        }

        if (earned) {
            newBadges.push(badge.id);
        }
    }

    if (newBadges.length > 0) {
        await prisma.volunteerBadge.createMany({
            data: newBadges.map((badgeId) => ({ userId, badgeId })),
            skipDuplicates: true,
        });
    }

    return newBadges;
}

export { checkAndAwardBadges };

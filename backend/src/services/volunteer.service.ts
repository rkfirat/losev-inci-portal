import prisma from '../config/database';
import { HourStatus } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../errors';

export class VolunteerService {
  static async logHours(userId: string, data: any) {
    return prisma.volunteerHour.create({
      data: {
        userId,
        projectName: data.projectName,
        description: data.description,
        hours: data.hours,
        date: new Date(data.date),
        status: HourStatus.PENDING,
      },
    });
  }

  static async getUserHours(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [hours, total] = await Promise.all([
      prisma.volunteerHour.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.volunteerHour.count({ where: { userId } }),
    ]);

    return {
      hours,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getPendingHours(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [hours, total] = await Promise.all([
      prisma.volunteerHour.findMany({
        where: { status: HourStatus.PENDING },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.volunteerHour.count({ where: { status: HourStatus.PENDING } }),
    ]);

    return {
      hours,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateHourStatus(hourId: string, status: HourStatus, approvedBy: string) {
    const hour = await prisma.volunteerHour.findUnique({
      where: { id: hourId },
    });

    if (!hour) {
      throw new NotFoundError('Volunteer hour record not found');
    }

    if (hour.status !== HourStatus.PENDING) {
      throw new ForbiddenError('Only pending hours can be updated');
    }

    const updatedHour = await prisma.volunteerHour.update({
      where: { id: hourId },
      data: {
        status,
        approvedBy,
      },
      include: {
        user: true
      }
    });

    if (status === HourStatus.APPROVED) {
        // Import BadgeService dynamically to avoid circular dependency if any, 
        // though here it should be fine.
        const { BadgeService } = require('./badge.service');
        await BadgeService.checkAndAwardBadges(updatedHour.userId);
    }

    return updatedHour;
  }

  static async getUserStats(userId: string) {
    const approvedHours = await prisma.volunteerHour.aggregate({
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

    const upcomingEvents = await prisma.eventParticipant.count({
      where: {
        userId,
        event: {
          startDate: { gte: new Date() },
        },
      },
    });

    return {
      totalHours: Number(approvedHours._sum.hours || 0),
      totalBadges,
      upcomingEvents,
    };
  }
}

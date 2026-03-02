import prisma from '../config/database';
import { UserRole } from '@prisma/client';

export class AdminService {
  static async getAllVolunteers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      role: UserRole.VOLUNTEER,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          isActive: true,
          school: true,
          createdAt: true,
          _count: {
            select: {
              volunteerHours: { where: { status: 'APPROVED' } },
              volunteerBadges: true,
            }
          }
        }
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  static async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('USER_NOT_FOUND');

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  static async deleteUser(userId: string) {
    // Soft delete or hard delete based on preference, here soft delete by deactivating
    return prisma.user.update({
      where: { id: userId },
      data: { isActive: false, deletedAt: new Date() },
    });
  }

  static async createEvent(data: any, creatorId: string) {
    return prisma.event.create({
      data: {
        ...data,
        createdBy: creatorId,
      },
    });
  }

  static async updateEvent(eventId: string, data: any) {
    return prisma.event.update({
      where: { id: eventId },
      data,
    });
  }

  static async deleteEvent(eventId: string) {
    return prisma.event.update({
      where: { id: eventId },
      data: { isActive: false },
    });
  }

  static async getVolunteerReport() {
    const hours = await prisma.volunteerHour.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, school: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    return hours.map(h => ({
      volunteer: `${h.user.firstName} ${h.user.lastName}`,
      email: h.user.email,
      school: h.user.school,
      project: h.projectName,
      hours: Number(h.hours),
      date: h.date.toISOString().split('T')[0],
    }));
  }

  static async createAnnouncement(data: { title: string, content: string, targetRole?: string }, creatorId: string) {
    return prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        targetRole: data.targetRole as UserRole | undefined,
        createdBy: creatorId,
      },
    });
  }
}

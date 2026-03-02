import { ParticipationStatus } from '@prisma/client';
import prisma from '../config/database';

export class EventService {
  async getAllEvents() {
    return prisma.event.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        startDate: 'asc',
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
        participants: {
          take: 5,
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async getEventById(id: string, userId?: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
        participants: {
          select: {
            status: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!event) return null;

    // Check if current user is participating
    let userParticipation = null;
    if (userId) {
      userParticipation = await prisma.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId: id,
            userId,
          },
        },
      });
    }

    return {
      ...event,
      isUserParticipating: !!userParticipation && userParticipation.status !== 'CANCELLED',
      userParticipationStatus: userParticipation?.status || null,
    };
  }

  async participate(eventId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Check event exists and has capacity with a lock if possible, 
      // but standard read within transaction is a good start.
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: {
              participants: {
                where: {
                  status: 'REGISTERED',
                },
              },
            },
          },
        },
      });

      if (!event) throw new Error('EVENT_NOT_FOUND');

      // Check if user already registered (to avoid double counting in logic)
      const existing = await tx.eventParticipant.findUnique({
        where: {
          eventId_userId: { eventId, userId }
        }
      });

      const isAlreadyRegistered = existing && existing.status === 'REGISTERED';

      if (!isAlreadyRegistered && event.capacity && event._count.participants >= event.capacity) {
        throw new Error('EVENT_FULL');
      }

      return tx.eventParticipant.upsert({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
        update: {
          status: 'REGISTERED' as ParticipationStatus,
        },
        create: {
          eventId,
          userId,
          status: 'REGISTERED' as ParticipationStatus,
        },
      });
    });
  }

  async cancelParticipation(eventId: string, userId: string) {
    return prisma.eventParticipant.update({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      data: {
        status: 'CANCELLED' as ParticipationStatus,
      },
    });
  }

  async createEvent(data: any) {
    return prisma.event.create({
      data,
    });
  }
}

export default new EventService();

import { prisma } from '../config/database';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';
import type { CreateEventInput, ListEventsQuery } from '../validators/event';
import { checkAndAwardBadges } from './volunteer-hour.service';

export async function listEvents(query: ListEventsQuery) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: Record<string, unknown> = { isActive: true, deletedAt: null };

    if (status === 'upcoming') {
        where.date = { gte: now };
    } else if (status === 'past') {
        where.date = { lt: now };
    }

    const [events, total] = await Promise.all([
        prisma.event.findMany({
            where,
            orderBy: { date: status === 'past' ? 'desc' : 'asc' },
            skip,
            take: limit,
            include: {
                _count: { select: { participants: true } },
            },
        }),
        prisma.event.count({ where }),
    ]);

    return {
        events: events.map((e) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            date: e.date,
            endDate: e.endDate,
            location: e.location,
            capacity: e.capacity,
            participantCount: e._count.participants,
            isFull: e.capacity ? e._count.participants >= e.capacity : false,
            createdAt: e.createdAt,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function getEventDetail(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            _count: { select: { participants: true } },
        },
    });

    if (!event || event.deletedAt) throw new NotFoundError('Event not found');

    const participation = await prisma.eventParticipant.findUnique({
        where: { eventId_userId: { eventId, userId } },
    });

    return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        endDate: event.endDate,
        location: event.location,
        capacity: event.capacity,
        participantCount: event._count.participants,
        isFull: event.capacity ? event._count.participants >= event.capacity : false,
        isParticipating: !!participation,
        createdAt: event.createdAt,
    };
}

export async function createEvent(userId: string, input: CreateEventInput) {
    const event = await prisma.event.create({
        data: {
            title: input.title,
            description: input.description || null,
            date: new Date(input.date),
            endDate: input.endDate ? new Date(input.endDate) : null,
            location: input.location || null,
            capacity: input.capacity || null,
            createdBy: userId,
        },
    });
    return event;
}

export async function participateEvent(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { _count: { select: { participants: true } } },
    });

    if (!event || event.deletedAt) throw new NotFoundError('Event not found');
    if (event.date < new Date()) throw new BadRequestError('Cannot join past events');
    if (event.capacity && event._count.participants >= event.capacity) {
        throw new BadRequestError('Event is full');
    }

    const existing = await prisma.eventParticipant.findUnique({
        where: { eventId_userId: { eventId, userId } },
    });
    if (existing) throw new ConflictError('Already participating');

    await prisma.eventParticipant.create({ data: { eventId, userId } });
    await checkAndAwardBadges(userId);

    return { message: 'Successfully joined the event' };
}

export async function cancelParticipation(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundError('Event not found');

    const participation = await prisma.eventParticipant.findUnique({
        where: { eventId_userId: { eventId, userId } },
    });
    if (!participation) throw new NotFoundError('Not participating in this event');

    await prisma.eventParticipant.delete({
        where: { eventId_userId: { eventId, userId } },
    });

    return { message: 'Participation cancelled' };
}

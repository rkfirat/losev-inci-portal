"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const database_1 = __importDefault(require("../config/database"));
class EventService {
    async getAllEvents() {
        return database_1.default.event.findMany({
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
    async getEventById(id, userId) {
        const event = await database_1.default.event.findUnique({
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
        if (!event)
            return null;
        // Check if current user is participating
        let userParticipation = null;
        if (userId) {
            userParticipation = await database_1.default.eventParticipant.findUnique({
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
    async participate(eventId, userId) {
        return database_1.default.$transaction(async (tx) => {
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
            if (!event)
                throw new Error('EVENT_NOT_FOUND');
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
                    status: 'REGISTERED',
                },
                create: {
                    eventId,
                    userId,
                    status: 'REGISTERED',
                },
            });
        });
    }
    async cancelParticipation(eventId, userId) {
        return database_1.default.eventParticipant.update({
            where: {
                eventId_userId: {
                    eventId,
                    userId,
                },
            },
            data: {
                status: 'CANCELLED',
            },
        });
    }
    async createEvent(data) {
        return database_1.default.event.create({
            data,
        });
    }
}
exports.EventService = EventService;
exports.default = new EventService();

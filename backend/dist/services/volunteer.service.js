"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerService = void 0;
const database_1 = __importDefault(require("../config/database"));
const client_1 = require("@prisma/client");
const errors_1 = require("../errors");
class VolunteerService {
    static async logHours(userId, data) {
        return database_1.default.volunteerHour.create({
            data: {
                userId,
                projectName: data.projectName,
                description: data.description,
                hours: data.hours,
                date: new Date(data.date),
                status: client_1.HourStatus.PENDING,
            },
        });
    }
    static async getUserHours(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [hours, total] = await Promise.all([
            database_1.default.volunteerHour.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                skip,
                take: limit,
            }),
            database_1.default.volunteerHour.count({ where: { userId } }),
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
            database_1.default.volunteerHour.findMany({
                where: { status: client_1.HourStatus.PENDING },
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
            database_1.default.volunteerHour.count({ where: { status: client_1.HourStatus.PENDING } }),
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
    static async updateHourStatus(hourId, status, approvedBy) {
        const hour = await database_1.default.volunteerHour.findUnique({
            where: { id: hourId },
        });
        if (!hour) {
            throw new errors_1.NotFoundError('Volunteer hour record not found');
        }
        if (hour.status !== client_1.HourStatus.PENDING) {
            throw new errors_1.ForbiddenError('Only pending hours can be updated');
        }
        const updatedHour = await database_1.default.volunteerHour.update({
            where: { id: hourId },
            data: {
                status,
                approvedBy,
            },
            include: {
                user: true
            }
        });
        if (status === client_1.HourStatus.APPROVED) {
            // Import BadgeService dynamically to avoid circular dependency if any, 
            // though here it should be fine.
            const { BadgeService } = require('./badge.service');
            await BadgeService.checkAndAwardBadges(updatedHour.userId);
        }
        return updatedHour;
    }
    static async getUserStats(userId) {
        const approvedHours = await database_1.default.volunteerHour.aggregate({
            where: {
                userId,
                status: client_1.HourStatus.APPROVED,
            },
            _sum: {
                hours: true,
            },
        });
        const totalBadges = await database_1.default.volunteerBadge.count({
            where: { userId },
        });
        const upcomingEvents = await database_1.default.eventParticipant.count({
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
exports.VolunteerService = VolunteerService;

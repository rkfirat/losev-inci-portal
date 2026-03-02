"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const database_1 = __importDefault(require("../config/database"));
const client_1 = require("@prisma/client");
class AdminService {
    static async getAllVolunteers(page = 1, limit = 20, search) {
        const skip = (page - 1) * limit;
        const where = {
            role: client_1.UserRole.VOLUNTEER,
        };
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            database_1.default.user.findMany({
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
            database_1.default.user.count({ where }),
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
    static async toggleUserStatus(userId) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('USER_NOT_FOUND');
        return database_1.default.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive },
        });
    }
    static async deleteUser(userId) {
        // Soft delete or hard delete based on preference, here soft delete by deactivating
        return database_1.default.user.update({
            where: { id: userId },
            data: { isActive: false, deletedAt: new Date() },
        });
    }
    static async createEvent(data, creatorId) {
        return database_1.default.event.create({
            data: {
                ...data,
                createdBy: creatorId,
            },
        });
    }
    static async updateEvent(eventId, data) {
        return database_1.default.event.update({
            where: { id: eventId },
            data,
        });
    }
    static async deleteEvent(eventId) {
        return database_1.default.event.update({
            where: { id: eventId },
            data: { isActive: false },
        });
    }
    static async getVolunteerReport() {
        const hours = await database_1.default.volunteerHour.findMany({
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
    static async createAnnouncement(data, creatorId) {
        return database_1.default.announcement.create({
            data: {
                title: data.title,
                content: data.content,
                targetRole: data.targetRole,
                createdBy: creatorId,
            },
        });
    }
}
exports.AdminService = AdminService;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventSchema = exports.createEventSchema = exports.updatePushTokenSchema = exports.sendAnnouncementSchema = exports.eventIdParamSchema = exports.updateVolunteerHourStatusSchema = exports.logVolunteerHourSchema = exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must be less than 128 characters')
            .regex(/[A-Z]/, 'Password must contain uppercase letter')
            .regex(/[a-z]/, 'Password must contain lowercase letter')
            .regex(/[0-9]/, 'Password must contain number'),
        firstName: zod_1.z.string().min(2, 'First name is required'),
        lastName: zod_1.z.string().min(2, 'Last name is required'),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.refreshSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
    }),
});
exports.logVolunteerHourSchema = zod_1.z.object({
    body: zod_1.z.object({
        projectName: zod_1.z.string().min(1, 'Project name is required').max(200),
        description: zod_1.z.string().max(1000).optional(),
        hours: zod_1.z.number().positive('Hours must be positive').max(24, 'Cannot log more than 24 hours at once'),
        date: zod_1.z.string().datetime().or(zod_1.z.date()),
    }),
});
exports.updateVolunteerHourStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid hour ID'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['APPROVED', 'REJECTED']),
    }),
});
exports.eventIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid event ID'),
    }),
});
exports.sendAnnouncementSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required').max(100),
        content: zod_1.z.string().min(1, 'Content is required').max(2000),
        targetRole: zod_1.z.enum(['VOLUNTEER', 'COORDINATOR', 'ADMIN']).optional().nullable(),
    }),
});
exports.updatePushTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        pushToken: zod_1.z.string().min(1, 'Push token is required'),
    }),
});
exports.createEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required').max(200),
        description: zod_1.z.string().max(2000).optional(),
        location: zod_1.z.string().max(500).optional(),
        startDate: zod_1.z.string().datetime(),
        endDate: zod_1.z.string().datetime(),
        capacity: zod_1.z.number().int().positive().optional(),
        imageUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    }),
});
exports.updateEventSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid event ID'),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(200).optional(),
        description: zod_1.z.string().max(2000).optional(),
        location: zod_1.z.string().max(500).optional(),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
        capacity: zod_1.z.number().int().positive().optional(),
        imageUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        isActive: zod_1.z.boolean().optional(),
    }),
});

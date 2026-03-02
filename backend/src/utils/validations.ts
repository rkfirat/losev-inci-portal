import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letter')
      .regex(/[a-z]/, 'Password must contain lowercase letter')
      .regex(/[0-9]/, 'Password must contain number'),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const logVolunteerHourSchema = z.object({
  body: z.object({
    projectName: z.string().min(1, 'Project name is required').max(200),
    description: z.string().max(1000).optional(),
    hours: z.number().positive('Hours must be positive').max(24, 'Cannot log more than 24 hours at once'),
    date: z.string().datetime().or(z.date()),
  }),
});

export const updateVolunteerHourStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid hour ID'),
  }),
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
  }),
});

export const eventIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid event ID'),
  }),
});

export const sendAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100),
    content: z.string().min(1, 'Content is required').max(2000),
    targetRole: z.enum(['VOLUNTEER', 'COORDINATOR', 'ADMIN']).optional().nullable(),
  }),
});

export const updatePushTokenSchema = z.object({
  body: z.object({
    pushToken: z.string().min(1, 'Push token is required'),
  }),
});

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(2000).optional(),
    location: z.string().max(500).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    capacity: z.number().int().positive().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
  }),
});

export const updateEventSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid event ID'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    location: z.string().max(500).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    capacity: z.number().int().positive().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  }),
});


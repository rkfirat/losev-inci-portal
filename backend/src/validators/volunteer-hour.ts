import { z } from 'zod';

const ACTIVITY_TYPES = ['SEMINAR', 'STAND', 'DONATION', 'FAIR', 'AWARENESS', 'SOCIAL_MEDIA', 'OTHER'] as const;

export const createVolunteerHourSchema = z.object({
    body: z.object({
        activityType: z.enum(ACTIVITY_TYPES, { errorMap: () => ({ message: 'Geçerli bir etkinlik türü seçiniz' }) }),
        projectName: z.string().min(1, 'Proje adı zorunludur').max(200),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-AA-GG formatında olmalıdır'),
        hours: z.number().min(0.5, 'En az 0.5 saat').max(12, 'En fazla 12 saat'),
        description: z.string().max(500).optional(),
        photoUrl: z.string().url().optional(),
        documentUrl: z.string().url().optional(),
    }),
});

export const listVolunteerHoursSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(50).default(20),
        status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
        activityType: z.enum(ACTIVITY_TYPES).optional(),
    }),
});

export const reviewVolunteerHourSchema = z.object({
    body: z.object({
        status: z.enum(['APPROVED', 'REJECTED']),
        reviewNote: z.string().max(500).optional(),
    }),
    params: z.object({
        id: z.string().uuid(),
    }),
});

export type CreateVolunteerHourInput = z.infer<typeof createVolunteerHourSchema>['body'];
export type ListVolunteerHoursQuery = z.infer<typeof listVolunteerHoursSchema>['query'];
export type ReviewVolunteerHourInput = z.infer<typeof reviewVolunteerHourSchema>['body'];

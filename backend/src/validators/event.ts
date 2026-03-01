import { z } from 'zod';

export const listEventsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(50).default(20),
        status: z.enum(['upcoming', 'past', 'all']).default('upcoming'),
    }),
});

export const createEventSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required').max(200),
        description: z.string().max(2000).optional(),
        date: z.string().datetime({ message: 'Invalid date format' }),
        endDate: z.string().datetime().optional(),
        location: z.string().max(300).optional(),
        capacity: z.number().int().min(1).optional(),
    }),
});

export type ListEventsQuery = z.infer<typeof listEventsSchema>['query'];
export type CreateEventInput = z.infer<typeof createEventSchema>['body'];

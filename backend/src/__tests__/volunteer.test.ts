import request from 'supertest';
import express, { Express } from 'express';
import volunteerRoutes from '../routes/volunteer.routes';
import prisma from '../config/database';
import { errorHandler } from '../middlewares/validate.middleware';
import { HourStatus } from '@prisma/client';

const app: Express = express();
app.use(express.json());

// Mock authenticate middleware
jest.mock('../middlewares/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { sub: 'test-user-id', email: 'test@example.com', role: 'VOLUNTEER' };
    next();
  },
  requireRole: (...roles: any[]) => (req: any, res: any, next: any) => next(),
}));

app.use('/api/v1/volunteers', volunteerRoutes);
app.use(errorHandler);

jest.mock('../index', () => ({
  prisma: {
    volunteerHour: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    volunteerBadge: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    eventParticipant: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('Volunteer Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/volunteers/log-hours', () => {
    it('should log hours successfully', async () => {
        (prisma.volunteerHour.create as jest.Mock).mockResolvedValue({
            id: 'hour-uuid',
            userId: 'test-user-id',
            projectName: 'Test Project',
            hours: 2,
            date: new Date(),
            status: HourStatus.PENDING
        });

        const res = await request(app)
            .post('/api/v1/volunteers/log-hours')
            .send({
                projectName: 'Test Project',
                hours: 2,
                date: new Date().toISOString(),
                description: 'Test description'
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.projectName).toBe('Test Project');
    });

    it('should fail with invalid data', async () => {
        const res = await request(app)
            .post('/api/v1/volunteers/log-hours')
            .send({
                projectName: '', // Empty name
                hours: -1, // Negative hours
                date: 'invalid-date'
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/volunteers/my-hours', () => {
    it('should return user hours', async () => {
        (prisma.volunteerHour.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.volunteerHour.count as jest.Mock).mockResolvedValue(0);

        const res = await request(app).get('/api/v1/volunteers/my-hours');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});

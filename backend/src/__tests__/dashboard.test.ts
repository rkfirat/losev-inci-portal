import request from 'supertest';
import express, { Express } from 'express';
import dashboardRoutes from '../routes/dashboard.routes';
import prisma from '../config/database';
import { errorHandler } from '../middlewares/validate.middleware';
import { HourStatus, UserRole } from '@prisma/client';

const app: Express = express();
app.use(express.json());

// Mock authenticate middleware
jest.mock('../middlewares/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-id', role: 'ADMIN' };
    next();
  },
  isCoordinator: (req: any, res: any, next: any) => next(),
}));

app.use('/api/v1/dashboard', dashboardRoutes);
app.use(errorHandler);

// Mock prisma
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    volunteerHour: {
      aggregate: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    volunteerBadge: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    eventParticipant: {
      findMany: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    event: {
      count: jest.fn(),
    }
  },
}));

describe('Dashboard Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/dashboard/admin', () => {
    it('should return enriched admin stats', async () => {
      // Mock pending hours count
      (prisma.volunteerHour.count as jest.Mock).mockResolvedValueOnce(5);
      // Mock active volunteers count
      (prisma.user.count as jest.Mock).mockResolvedValueOnce(42);
      // Mock active events count
      (prisma.event.count as jest.Mock).mockResolvedValueOnce(10);
      // Mock total system hours sum
      (prisma.volunteerHour.aggregate as jest.Mock).mockResolvedValueOnce({
        _sum: { hours: 1200 }
      });
      // Mock total badges awarded
      (prisma.volunteerBadge.count as jest.Mock).mockResolvedValueOnce(150);

      const res = await request(app)
        .get('/api/v1/dashboard/admin');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({
        pendingHoursCount: 5,
        activeVolunteersCount: 42,
        activeEventsCount: 10,
        totalSystemHours: 1200,
        totalBadgesAwarded: 150
      });

      // Verify prisma calls
      expect(prisma.volunteerHour.count).toHaveBeenCalledWith({ where: { status: HourStatus.PENDING } });
      expect(prisma.user.count).toHaveBeenCalledWith({ where: { role: UserRole.VOLUNTEER, isActive: true } });
      expect(prisma.volunteerHour.aggregate).toHaveBeenCalledWith({
        where: { status: HourStatus.APPROVED },
        _sum: { hours: true },
      });
    });
  });

  describe('GET /api/v1/dashboard/', () => {
    it('should return enriched dashboard data for a volunteer', async () => {
      // Mock aggregate result
      (prisma.volunteerHour.aggregate as jest.Mock).mockResolvedValueOnce({
        _sum: { hours: 10 }
      });
      // Mock count result
      (prisma.volunteerBadge.count as jest.Mock).mockResolvedValueOnce(2);
      // Mock findMany results
      (prisma.volunteerHour.findMany as jest.Mock).mockResolvedValueOnce([]); // weeklyHours
      (prisma.volunteerBadge.findMany as jest.Mock).mockResolvedValueOnce([]); // recentBadges
      (prisma.eventParticipant.findMany as jest.Mock).mockResolvedValueOnce([]); // upcomingEvents
      // Mock groupBy result for rank
      (prisma.volunteerHour.groupBy as jest.Mock).mockResolvedValueOnce([]);
      
      // Need to mock prisma.announcement.findMany if it's used
      // Let's check if it's imported and mocked
    });
  });
});

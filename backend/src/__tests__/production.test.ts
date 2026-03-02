import request from 'supertest';
import express from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import apiRoutes from '../routes';
import { errorHandler } from '../middlewares/validate.middleware';
import { generateAccessToken } from '../utils/jwt';
import { prismaMock } from './setup';

const app = express();
app.use(express.json());
app.use('/api/v1', apiRoutes);
app.use(errorHandler);

describe('Production Ready Integration Tests', () => {
  let adminToken: string;
  let volunteerToken: string;
  let volunteerId: string;
  let adminId: string;

  beforeAll(async () => {
    adminId = '550e8400-e29b-41d4-a716-446655440001';
    volunteerId = '550e8400-e29b-41d4-a716-446655440002';

    adminToken = generateAccessToken({
      sub: adminId,
      email: 'admin@losev.org.tr',
      role: UserRole.ADMIN,
    });

    volunteerToken = generateAccessToken({
      sub: volunteerId,
      email: 'vol@test.com',
      role: UserRole.VOLUNTEER,
    });
  });

  describe('Event Management', () => {
    const eventId = '550e8400-e29b-41d4-a716-446655440003';

    it('should allow volunteer to participate', async () => {
      prismaMock.event.findUnique.mockResolvedValue({ id: eventId, capacity: 10, _count: { participants: 0 } } as any);
      prismaMock.eventParticipant.create.mockResolvedValue({ id: '550e8400-e29b-41d4-a716-446655440004', eventId, userId: volunteerId } as any);

      const res = await request(app)
        .post(`/api/v1/events/${eventId}/participate`)
        .set('Authorization', `Bearer ${volunteerToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should show event detail', async () => {
      prismaMock.event.findUnique.mockResolvedValue({
        id: eventId,
        title: 'Test Event',
        participants: [{ id: '550e8400-e29b-41d4-a716-446655440004', userId: volunteerId }],
      } as any);

      const res = await request(app)
        .get(`/api/v1/events/${eventId}`)
        .set('Authorization', `Bearer ${volunteerToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(eventId);
    });
  });

  describe('Leaderboard & Coordinator', () => {
    it('should log hours as volunteer', async () => {
      prismaMock.volunteerHour.create.mockResolvedValue({ id: '550e8400-e29b-41d4-a716-446655440005', userId: volunteerId, hours: 5 } as any);

      const res = await request(app)
        .post('/api/v1/volunteers/log-hours')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          projectName: 'Project X',
          hours: 5,
          date: new Date(),
          description: 'Worked hard'
        });
      
      expect(res.status).toBe(201);
    });

    it('should show pending hours to coordinator', async () => {
      prismaMock.volunteerHour.findMany.mockResolvedValue([{ id: '550e8400-e29b-41d4-a716-446655440005', hours: 5, status: 'PENDING' }] as any);
      prismaMock.volunteerHour.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/coordinator/hours/pending')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should allow coordinator to approve hours', async () => {
      const hourId = '550e8400-e29b-41d4-a716-446655440005';
      prismaMock.volunteerHour.findUnique.mockResolvedValue({ id: hourId, status: 'PENDING', userId: volunteerId } as any);
      prismaMock.volunteerHour.update.mockResolvedValue({ id: hourId, status: 'APPROVED', userId: volunteerId } as any);
      
      // Mocks for BadgeService
      prismaMock.volunteerHour.aggregate.mockResolvedValue({ _sum: { hours: 5 } } as any);
      prismaMock.volunteerBadge.findMany.mockResolvedValue([]);
      prismaMock.badge.findMany.mockResolvedValue([]);

      const res = await request(app)
        .patch(`/api/v1/coordinator/hours/${hourId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('APPROVED');
    });

    it('should reflect approved hours in leaderboard', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: volunteerId,
          firstName: 'Vol',
          lastName: 'Test',
          volunteerHours: [{ hours: 5 }],
          _count: { volunteerBadges: 0 }
        }
      ] as any);

      const res = await request(app)
        .get('/api/v1/leaderboard/volunteers')
        .set('Authorization', `Bearer ${volunteerToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data[0].totalHours).toBe(5);
    });
  });
});

import dotenv from 'dotenv';
import path from 'path';

// Load env before anything else
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import request from 'supertest';
import express from 'express';
import apiRoutes from '../routes';
import { errorHandler } from '../middlewares/validate.middleware';
import { prismaMock } from './setup';
import { UserRole, HourStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// Add healthcheck manually for testing
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/v1', apiRoutes);
app.use(errorHandler);

const secret = process.env.JWT_SECRET || 'secret';

const generateToken = (id: string, role: UserRole) => {
  return jwt.sign({ id, role }, secret);
};

describe('Deep Regression & QA Testing', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.VOLUNTEER,
  };

  const volunteerToken = generateToken(mockUser.id, UserRole.VOLUNTEER);
  const coordinatorToken = generateToken('coord-1', UserRole.COORDINATOR);

  describe('1. Auth & Security Deep Test', () => {
    it('should reject requests with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(res.status).toBe(401);
    });

    it('should reject volunteer from coordinator routes (RBAC check)', async () => {
      const res = await request(app)
        .get('/api/v1/coordinator/hours/pending')
        .set('Authorization', `Bearer ${volunteerToken}`);
      
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('2. Validation Stress Test', () => {
    it('should reject invalid email during registration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Password123',
          firstName: 'A',
          lastName: 'B'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject logging more than 24 hours at once', async () => {
      const res = await request(app)
        .post('/api/v1/volunteers/log-hours')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          projectName: 'Too Much Work',
          hours: 25,
          date: new Date().toISOString()
        });
      
      expect(res.status).toBe(400);
    });
  });

  describe('3. Production Logic Deep Test', () => {
    it('should correctly handle hour approval and invalidation', async () => {
      const hourId = '550e8400-e29b-41d4-a716-446655440001';
      // Mock finding the hour
      prismaMock.volunteerHour.findUnique.mockResolvedValue({
        id: hourId,
        userId: 'user-1',
        status: HourStatus.PENDING,
        hours: 5 as any,
      } as any);

      // Mock update
      prismaMock.volunteerHour.update.mockResolvedValue({
        id: hourId,
        status: HourStatus.APPROVED,
        userId: 'user-1'
      } as any);

      // Mock aggregate for BadgeService check
      prismaMock.volunteerHour.aggregate.mockResolvedValue({
        _sum: { hours: 5 }
      } as any);
      prismaMock.volunteerBadge.findMany.mockResolvedValue([]);
      prismaMock.volunteerBadge.count.mockResolvedValue(0);
      prismaMock.eventParticipant.count.mockResolvedValue(0);
      prismaMock.badge.findMany.mockResolvedValue([]);

      const res = await request(app)
        .patch(`/api/v1/coordinator/hours/${hourId}/status`)
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({ status: 'APPROVED' });
      
      expect(res.status).toBe(200);
      expect(prismaMock.volunteerHour.update).toHaveBeenCalled();
    });

    it('should return 404 for non-existent event', async () => {
      prismaMock.event.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/v1/events/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${volunteerToken}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('4. Infrastructure Test', () => {
    it('should handle healthcheck', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });
});

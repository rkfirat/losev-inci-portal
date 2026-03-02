import request from 'supertest';
import express from 'express';
import { UserRole } from '@prisma/client';
import apiRoutes from '../routes';
import { errorHandler } from '../middlewares/validate.middleware';
import { prismaMock } from './setup';
import { generateAccessToken } from '../utils/jwt';

const app = express();
app.use(express.json());
app.use('/api/v1', apiRoutes);
app.use(errorHandler);

describe('Admin Volunteer Management (US-080)', () => {
  const adminToken = generateAccessToken({ sub: 'admin-1', email: 'admin@test.com', role: UserRole.ADMIN });
  const volunteerToken = generateAccessToken({ sub: 'vol-1', email: 'vol@test.com', role: UserRole.VOLUNTEER });

  const mockVolunteers = [
    {
      id: 'vol-1',
      email: 'volunteer1@test.com',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      role: UserRole.VOLUNTEER,
      _count: { volunteerHours: 5, volunteerBadges: 2 }
    },
    {
      id: 'vol-2',
      email: 'volunteer2@test.com',
      firstName: 'Jane',
      lastName: 'Smith',
      isActive: true,
      role: UserRole.VOLUNTEER,
      _count: { volunteerHours: 10, volunteerBadges: 3 }
    }
  ];

  it('should list all volunteers for admin', async () => {
    prismaMock.user.findMany.mockResolvedValue(mockVolunteers as any);
    prismaMock.user.count.mockResolvedValue(2);

    const res = await request(app)
      .get('/api/v1/admin/volunteers')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(2);
  });

  it('should search volunteers by name', async () => {
    prismaMock.user.findMany.mockResolvedValue([mockVolunteers[1]] as any);
    prismaMock.user.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/v1/admin/volunteers?search=Jane')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].firstName).toBe('Jane');
    
    // Verify search was passed to prisma
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        OR: expect.arrayContaining([
          { firstName: { contains: 'Jane', mode: 'insensitive' } }
        ])
      })
    }));
  });

  it('should toggle volunteer active status', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockVolunteers[0] as any);
    prismaMock.user.update.mockResolvedValue({ ...mockVolunteers[0], isActive: false } as any);

    const res = await request(app)
      .patch(`/api/v1/admin/volunteers/vol-1/toggle-status`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'vol-1' },
      data: { isActive: false }
    });
  });

  it('should soft delete (deactivate) volunteer', async () => {
    prismaMock.user.update.mockResolvedValue({ ...mockVolunteers[0], isActive: false, deletedAt: new Date() } as any);

    const res = await request(app)
      .delete(`/api/v1/admin/volunteers/vol-1`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'vol-1' },
      data: expect.objectContaining({ isActive: false, deletedAt: expect.any(Date) })
    });
  });

  it('should deny access to non-admins', async () => {
    const res = await request(app)
      .get('/api/v1/admin/volunteers')
      .set('Authorization', `Bearer ${volunteerToken}`);
    
    expect(res.status).toBe(403);
  });
});


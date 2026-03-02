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

describe('Admin Event Management (US-081)', () => {
  const adminToken = generateAccessToken({ sub: 'admin-1', email: 'admin@test.com', role: UserRole.ADMIN });
  const eventId = '550e8400-e29b-41d4-a716-446655440000';

  const mockEvent = {
    id: eventId,
    title: 'Test Event',
    description: 'Test Desc',
    location: 'Test Location',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isActive: true,
    createdBy: 'admin-1'
  };

  it('should create an event', async () => {
    prismaMock.event.create.mockResolvedValue(mockEvent as any);

    const res = await request(app)
      .post('/api/v1/admin/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Test Event',
        description: 'Test Desc',
        location: 'Test Location',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString()
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Test Event');
    expect(prismaMock.event.create).toHaveBeenCalled();
  });

  it('should update an event', async () => {
    const updatedEvent = { ...mockEvent, title: 'Updated Title' };
    prismaMock.event.update.mockResolvedValue(updatedEvent as any);

    const res = await request(app)
      .patch(`/api/v1/admin/events/${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Title' });
    
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
    expect(prismaMock.event.update).toHaveBeenCalledWith({
      where: { id: eventId },
      data: { title: 'Updated Title' }
    });
  });

  it('should delete (deactivate) an event', async () => {
    prismaMock.event.update.mockResolvedValue({ ...mockEvent, isActive: false } as any);

    const res = await request(app)
      .delete(`/api/v1/admin/events/${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(prismaMock.event.update).toHaveBeenCalledWith({
      where: { id: eventId },
      data: { isActive: false }
    });
  });
});

import request from 'supertest';
import express from 'express';
import { UserRole } from '@prisma/client';
import apiRoutes from '../routes';
import { errorHandler } from '../middlewares/validate.middleware';
import { prismaMock } from './setup';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/v1', apiRoutes);
app.use(errorHandler);

const secret = process.env.JWT_SECRET || 'secret';

describe('Admin Announcements (US-083)', () => {
  const adminToken = jwt.sign({ id: 'admin-1', role: UserRole.ADMIN }, secret);

  it('should create an announcement for all users', async () => {
    prismaMock.announcement.create.mockResolvedValue({
      id: 'ann-1',
      title: 'Global Announcement',
      content: 'Hello everyone',
      targetRole: null,
      createdBy: 'admin-1',
      createdAt: new Date()
    } as any);

    const res = await request(app)
      .post('/api/v1/admin/announcements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Global Announcement',
        content: 'Hello everyone'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prismaMock.announcement.create).toHaveBeenCalledWith({
      data: {
        title: 'Global Announcement',
        content: 'Hello everyone',
        targetRole: undefined,
        createdBy: 'admin-1'
      }
    });
  });

  it('should create an announcement for specific role', async () => {
    prismaMock.announcement.create.mockResolvedValue({
      id: 'ann-2',
      title: 'Volunteer Only',
      content: 'Important',
      targetRole: UserRole.VOLUNTEER,
      createdBy: 'admin-1',
      createdAt: new Date()
    } as any);

    const res = await request(app)
      .post('/api/v1/admin/announcements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Volunteer Only',
        content: 'Important',
        targetRole: 'VOLUNTEER'
      });
    
    expect(res.status).toBe(200);
    expect(prismaMock.announcement.create).toHaveBeenCalledWith({
      data: {
        title: 'Volunteer Only',
        content: 'Important',
        targetRole: UserRole.VOLUNTEER,
        createdBy: 'admin-1'
      }
    });
  });
});

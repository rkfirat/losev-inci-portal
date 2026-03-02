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

describe('Admin Reports (US-082)', () => {
  const adminToken = jwt.sign({ id: 'admin-1', role: UserRole.ADMIN }, secret);

  const mockReport = [
    {
      volunteer: 'John Doe',
      email: 'john@test.com',
      school: '42 IST',
      project: 'Project X',
      hours: 5,
      date: '2024-03-01'
    }
  ];

  it('should return report as JSON', async () => {
    // Mocking findMany for volunteerHour and user
    // The AdminService.getVolunteerReport uses include: { user: ... }
    prismaMock.volunteerHour.findMany.mockResolvedValue([
      {
        id: 'h-1',
        projectName: 'Project X',
        hours: 5 as any,
        date: new Date('2024-03-01'),
        user: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', school: '42 IST' }
      }
    ] as any);

    const res = await request(app)
      .get('/api/v1/admin/reports/volunteers')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].volunteer).toBe('John Doe');
  });

  it('should export report as CSV', async () => {
    prismaMock.volunteerHour.findMany.mockResolvedValue([
      {
        id: 'h-1',
        projectName: 'Project X',
        hours: 5 as any,
        date: new Date('2024-03-01'),
        user: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', school: '42 IST' }
      }
    ] as any);

    const res = await request(app)
      .get('/api/v1/admin/reports/volunteers/csv')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/csv');
    expect(res.text).toContain('Volunteer,Email,School,Project,Hours,Date');
    expect(res.text).toContain('"John Doe","john@test.com","42 IST","Project X","5","2024-03-01"');
  });
});

import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from '../routes/auth.routes';
import { errorHandler } from '../middlewares/validate.middleware';
import { prismaMock } from './setup';

const app: Express = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use(errorHandler);

describe('Auth Routes', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);
        prismaMock.user.create.mockResolvedValue({
            id: 'test-uuid',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'VOLUNTEER',
            coalitionId: null,
        } as any);
        prismaMock.session.create.mockResolvedValue({} as any);

        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Password1!',
                firstName: 'Test',
                lastName: 'User'
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe('test@example.com');
        expect(res.body.data.tokens).toHaveProperty('accessToken');
    });

    it('should fail if email already exists', async () => {
        prismaMock.user.findUnique.mockResolvedValue({ id: 'exists' } as any);

        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Password1!',
                firstName: 'Test',
                lastName: 'User'
            });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
     it('should reject invalid credentials', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'invalid@example.com',
                password: 'WrongPassword1!'
            });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
     });
  });
});

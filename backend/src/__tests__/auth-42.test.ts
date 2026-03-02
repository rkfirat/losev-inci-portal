import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from '../routes/auth.routes';
import { errorHandler } from '../middlewares/validate.middleware';
import { prismaMock } from './setup';

const app: Express = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use(errorHandler);

describe('Auth 42 OAuth Routes', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('GET /api/v1/auth/42', () => {
    it('should return 42 auth URL', async () => {
      process.env.INTRA_CLIENT_ID = 'test_client_id';
      process.env.INTRA_REDIRECT_URI = 'http://test.com/callback';

      const res = await request(app).get('/api/v1/auth/42');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.authUrl).toContain('https://api.intra.42.fr/oauth/authorize');
      expect(res.body.data.authUrl).toContain('client_id=test_client_id');
      expect(res.body.data.authUrl).toContain('redirect_uri=http%3A%2F%2Ftest.com%2Fcallback');
    });
  });

  describe('GET /api/v1/auth/42/callback', () => {
    it('should login/register user with 42 code', async () => {
      process.env.INTRA_CLIENT_ID = 'test_client_id';
      process.env.INTRA_CLIENT_SECRET = 'test_secret';
      process.env.INTRA_REDIRECT_URI = 'http://test.com/callback';
      process.env.OAUTH_SUCCESS_REDIRECT = 'losev-inci-portal://auth/success';

      const mockTokenResponse = {
        ok: true,
        json: async () => ({ access_token: 'test_access_token' }),
      };

      const mockUserResponse = {
        ok: true,
        json: async () => ({
          email: 'test42@example.com',
          login: 'testuser',
          first_name: 'Test',
          last_name: '42',
          image: { link: 'http://avatar.com/1' },
          campus: [{ name: '42 Istanbul' }],
        }),
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockTokenResponse)
        .mockResolvedValueOnce(mockUserResponse);

      prismaMock.user.findUnique.mockResolvedValue(null); // New user
      prismaMock.user.create.mockResolvedValue({
        id: 'new-uuid',
        email: 'test42@example.com',
        role: 'VOLUNTEER',
      } as any);
      prismaMock.session.create.mockResolvedValue({} as any);

      const res = await request(app).get('/api/v1/auth/42/callback?code=test_code');

      expect(res.status).toBe(302); // Redirect
      expect(res.header.location).toContain('losev-inci-portal://auth/success');
      expect(res.header.location).toContain('accessToken=');
      expect(res.header.location).toContain('refreshToken=');
      expect(res.header.location).toContain('userId=new-uuid');

      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('should link 42 to existing user with same email', async () => {
      process.env.INTRA_CLIENT_ID = 'test_client_id';
      process.env.INTRA_CLIENT_SECRET = 'test_secret';
      
      const mockTokenResponse = {
        ok: true,
        json: async () => ({ access_token: 'test_access_token' }),
      };

      const mockUserResponse = {
        ok: true,
        json: async () => ({
          email: 'existing@example.com',
          login: 'existinguser',
          first_name: 'Existing',
          last_name: 'User',
        }),
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockTokenResponse)
        .mockResolvedValueOnce(mockUserResponse);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'existing-uuid',
        email: 'existing@example.com',
        role: 'VOLUNTEER',
      } as any);
      prismaMock.user.update.mockResolvedValue({
        id: 'existing-uuid',
        email: 'existing@example.com',
        role: 'VOLUNTEER',
      } as any);
      prismaMock.session.create.mockResolvedValue({} as any);

      const res = await request(app).get('/api/v1/auth/42/callback?code=test_code');

      expect(res.status).toBe(302);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'existing-uuid' },
        data: expect.objectContaining({ intraLogin: 'existinguser' }),
      });
    });

    it('should return error if code is missing', async () => {
      const res = await request(app).get('/api/v1/auth/42/callback');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});

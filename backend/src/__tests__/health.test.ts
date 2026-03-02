import request from 'supertest';
import express, { Request, Response } from 'express';

// Setup basic app for testing routes directly if needed
const app = express();
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'LÖSEV İnci Portalı API is running' });
});

describe('Health Check API', () => {
  it('should return 200 OK for /health', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message', 'LÖSEV İnci Portalı API is running');
  });
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './config/logger';

const app = express();

// Trust proxy (required for localtunnel / ngrok)
app.set('trust proxy', true);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: true, // Allow all origins in dev (tunnel URLs are dynamic)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder'],
  }),
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api/v1', router);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Global error handler
app.use(errorHandler);

export { app };

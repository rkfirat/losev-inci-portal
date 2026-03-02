import dotenv from 'dotenv';
dotenv.config();

import * as Sentry from "@sentry/node";
import { initSentry } from './config/sentry';

initSentry();

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/validate.middleware';
import logger from './utils/logger';
import prisma from './config/database';

const app = express();
const port = process.env.PORT || 3000;

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-7', // set `RateLimit` and `RateLimit-Policy` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again after 15 minutes',
    },
  },
});

// Middlewares
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:19006', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
}));

// Apply rate limiter to all routes
app.use('/api/', limiter);

// Routes
app.use('/api/v1', apiRoutes);

// Enhanced healthcheck
app.get('/health', async (req: Request, res: Response) => {
  let dbStatus = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    dbStatus = 'error';
    logger.error('Healthcheck DB error:', e);
  }

  const status = dbStatus === 'ok' ? 200 : 503;
  res.status(status).json({
    status: dbStatus === 'ok' ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      server: 'ok',
    },
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Sentry error handler
Sentry.setupExpressErrorHandler(app);

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`🚀 Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

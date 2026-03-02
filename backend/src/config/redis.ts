import Redis from 'ioredis';
import logger from '../utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redis: any;

try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1, // Minimize noise if not running
    retryStrategy(times) {
      if (times > 3) return null; // Stop retrying after 3 attempts
      return 2000;
    },
  });

  redis.on('connect', () => {
    logger.info('Connected to Redis');
  });

  redis.on('error', (error: any) => {
    // Log as warning instead of error to avoid spamming in local dev
    logger.warn('Redis is not available, falling back to database only.');
  });
} catch (e) {
  logger.warn('Failed to initialize Redis client.');
}

export default redis;

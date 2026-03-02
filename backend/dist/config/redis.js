"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("../utils/logger"));
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redis;
try {
    redis = new ioredis_1.default(redisUrl, {
        maxRetriesPerRequest: 1, // Minimize noise if not running
        retryStrategy(times) {
            if (times > 3)
                return null; // Stop retrying after 3 attempts
            return 2000;
        },
    });
    redis.on('connect', () => {
        logger_1.default.info('Connected to Redis');
    });
    redis.on('error', (error) => {
        // Log as warning instead of error to avoid spamming in local dev
        logger_1.default.warn('Redis is not available, falling back to database only.');
    });
}
catch (e) {
    logger_1.default.warn('Failed to initialize Redis client.');
}
exports.default = redis;

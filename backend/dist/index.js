"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const Sentry = __importStar(require("@sentry/node"));
const sentry_1 = require("./config/sentry");
(0, sentry_1.initSentry)();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = require("express-rate-limit");
const routes_1 = __importDefault(require("./routes"));
const validate_middleware_1 = require("./middlewares/validate.middleware");
const logger_1 = __importDefault(require("./utils/logger"));
const database_1 = __importDefault(require("./config/database"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Rate Limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
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
app.use((0, helmet_1.default)());
// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:19006', 'http://localhost:3000'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
// Request logging
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_1.default.http(message.trim()),
    },
}));
// Apply rate limiter to all routes
app.use('/api/', limiter);
// Routes
app.use('/api/v1', routes_1.default);
// Enhanced healthcheck
app.get('/health', async (req, res) => {
    let dbStatus = 'ok';
    try {
        await database_1.default.$queryRaw `SELECT 1`;
    }
    catch (e) {
        dbStatus = 'error';
        logger_1.default.error('Healthcheck DB error:', e);
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
app.use(validate_middleware_1.errorHandler);
app.listen(port, () => {
    logger_1.default.info(`🚀 Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

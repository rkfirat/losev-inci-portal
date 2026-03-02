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
exports.NotificationService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class NotificationService {
    static async sendPushNotification(notification) {
        if (!notification.to || !notification.to.startsWith('ExponentPushToken')) {
            logger_1.default.warn(`Invalid push token: ${notification.to}`);
            return;
        }
        try {
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notification),
            });
            const resData = await response.json();
            logger_1.default.info('Push notification sent', resData);
            return resData;
        }
        catch (error) {
            logger_1.default.error('Error sending push notification', error);
            throw error;
        }
    }
    static async notifyUser(userId, title, body, data) {
        try {
            // Import prisma here to avoid circular dependencies if any
            const prisma = (await Promise.resolve().then(() => __importStar(require('../config/database')))).default;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { pushToken: true }
            });
            if (user?.pushToken) {
                await this.sendPushNotification({
                    to: user.pushToken,
                    title,
                    body,
                    data
                });
            }
        }
        catch (error) {
            logger_1.default.error(`Failed to notify user ${userId}`, error);
        }
    }
}
exports.NotificationService = NotificationService;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoordinatorController = void 0;
const volunteer_service_1 = require("../services/volunteer.service");
const leaderboard_service_1 = require("../services/leaderboard.service");
const notification_service_1 = require("../services/notification.service");
const logger_1 = __importDefault(require("../utils/logger"));
const client_1 = require("@prisma/client");
class CoordinatorController {
    async getPendingHours(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const { hours, pagination } = await volunteer_service_1.VolunteerService.getPendingHours(page, limit);
            res.json({
                success: true,
                data: hours,
                meta: pagination,
            });
        }
        catch (error) {
            logger_1.default.error('CoordinatorController getPendingHours error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch pending hours' },
            });
        }
    }
    async updateHourStatus(req, res) {
        try {
            const id = req.params.id;
            const { status } = req.body;
            const coordinatorId = req.user.sub;
            if (![client_1.HourStatus.APPROVED, client_1.HourStatus.REJECTED].includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'Invalid status' },
                });
            }
            const updatedHour = await volunteer_service_1.VolunteerService.updateHourStatus(id, status, coordinatorId);
            // Notify User
            const statusText = status === client_1.HourStatus.APPROVED ? 'onaylandı' : 'reddedildi';
            await notification_service_1.NotificationService.notifyUser(updatedHour.userId, 'Gönüllülük Saati Durumu', `${updatedHour.projectName} saatiniz ${statusText}.`, { type: 'HOUR_UPDATE', status, id: updatedHour.id });
            // Invalidate leaderboard cache if hours approved
            if (status === client_1.HourStatus.APPROVED) {
                await leaderboard_service_1.LeaderboardService.invalidateCache();
            }
            res.json({
                success: true,
                data: updatedHour,
            });
        }
        catch (error) {
            logger_1.default.error('CoordinatorController updateHourStatus error:', error);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({
                success: false,
                error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
            });
        }
    }
}
exports.CoordinatorController = CoordinatorController;
exports.default = new CoordinatorController();

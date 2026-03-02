"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardController = void 0;
const leaderboard_service_1 = __importDefault(require("../services/leaderboard.service"));
const logger_1 = __importDefault(require("../utils/logger"));
class LeaderboardController {
    async getTopVolunteers(req, res) {
        try {
            const leaderboard = await leaderboard_service_1.default.getTopVolunteers();
            res.json({
                success: true,
                data: leaderboard,
            });
        }
        catch (error) {
            logger_1.default.error('LeaderboardController getTopVolunteers error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch leaderboard' },
            });
        }
    }
    async getTeamLeaderboard(req, res) {
        try {
            const leaderboard = await leaderboard_service_1.default.getTeamLeaderboard();
            res.json({
                success: true,
                data: leaderboard,
            });
        }
        catch (error) {
            logger_1.default.error('LeaderboardController getTeamLeaderboard error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch team leaderboard' },
            });
        }
    }
}
exports.LeaderboardController = LeaderboardController;
exports.default = new LeaderboardController();

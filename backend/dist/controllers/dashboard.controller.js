"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboard = exports.getDashboard = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const getDashboard = async (req, res) => {
    try {
        const userId = req.user.sub;
        const userRole = req.user.role;
        const data = await dashboard_service_1.DashboardService.getDashboardData(userId, userRole);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.getDashboard = getDashboard;
const getAdminDashboard = async (req, res) => {
    try {
        const stats = await dashboard_service_1.DashboardService.getAdminStats();
        res.json({ success: true, data: stats });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.getAdminDashboard = getAdminDashboard;

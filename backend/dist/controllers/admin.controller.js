"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
const logger_1 = __importDefault(require("../utils/logger"));
const pdf_1 = require("../utils/pdf");
class AdminController {
    async getVolunteers(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const search = req.query.search;
            const data = await admin_service_1.AdminService.getAllVolunteers(page, limit, search);
            res.json({ success: true, data: data.users, meta: data.pagination });
        }
        catch (error) {
            logger_1.default.error('AdminController getVolunteers error:', error);
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async toggleStatus(req, res) {
        try {
            const id = req.params.id;
            const user = await admin_service_1.AdminService.toggleUserStatus(id);
            res.json({ success: true, data: user });
        }
        catch (error) {
            logger_1.default.error('AdminController toggleStatus error:', error);
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async deleteUser(req, res) {
        try {
            const id = req.params.id;
            await admin_service_1.AdminService.deleteUser(id);
            res.json({ success: true, message: 'User deactivated successfully' });
        }
        catch (error) {
            logger_1.default.error('AdminController deleteUser error:', error);
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async createEvent(req, res) {
        try {
            const creatorId = req.user.sub;
            const event = await admin_service_1.AdminService.createEvent(req.body, creatorId);
            res.status(201).json({ success: true, data: event });
        }
        catch (error) {
            logger_1.default.error('AdminController createEvent error:', error);
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async updateEvent(req, res) {
        try {
            const id = req.params.id;
            const event = await admin_service_1.AdminService.updateEvent(id, req.body);
            res.json({ success: true, data: event });
        }
        catch (error) {
            logger_1.default.error('AdminController updateEvent error:', error);
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async deleteEvent(req, res) {
        try {
            const id = req.params.id;
            await admin_service_1.AdminService.deleteEvent(id);
            res.json({ success: true, message: 'Event deactivated successfully' });
        }
        catch (error) {
            logger_1.default.error('AdminController deleteEvent error:', error);
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async getReport(req, res) {
        try {
            const report = await admin_service_1.AdminService.getVolunteerReport();
            res.json({ success: true, data: report });
        }
        catch (error) {
            logger_1.default.error('AdminController getReport error:', error);
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async getReportCSV(req, res) {
        try {
            const report = await admin_service_1.AdminService.getVolunteerReport();
            const headers = ['Volunteer', 'Email', 'School', 'Project', 'Hours', 'Date'];
            const rows = report.map(h => [
                h.volunteer,
                h.email,
                h.school || '',
                h.project,
                h.hours,
                h.date
            ]);
            const csv = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=volunteer_report_${new Date().toISOString().split('T')[0]}.csv`);
            res.status(200).send(csv);
        }
        catch (error) {
            logger_1.default.error('AdminController getReportCSV error:', error);
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async getReportPDF(req, res) {
        try {
            const report = await admin_service_1.AdminService.getVolunteerReport();
            pdf_1.PDFUtils.generateVolunteerReport(res, report);
        }
        catch (error) {
            logger_1.default.error('AdminController getReportPDF error:', error);
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
    async sendAnnouncement(req, res) {
        try {
            const creatorId = req.user.sub;
            const result = await admin_service_1.AdminService.createAnnouncement(req.body, creatorId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            logger_1.default.error('AdminController sendAnnouncement error:', error);
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
}
exports.AdminController = AdminController;
exports.default = new AdminController();

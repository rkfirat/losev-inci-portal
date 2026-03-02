"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = __importDefault(require("../controllers/admin.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const validations_1 = require("../utils/validations");
const router = (0, express_1.Router)();
// Strict security: Only admins can access these
router.use(auth_middleware_1.authenticate, role_middleware_1.isAdmin);
router.get('/volunteers', admin_controller_1.default.getVolunteers);
router.patch('/volunteers/:id/toggle-status', admin_controller_1.default.toggleStatus);
router.delete('/volunteers/:id', admin_controller_1.default.deleteUser);
// Event Management
router.post('/events', admin_controller_1.default.createEvent);
router.patch('/events/:id', admin_controller_1.default.updateEvent);
router.delete('/events/:id', admin_controller_1.default.deleteEvent);
// Reports & Announcements
router.get('/reports/volunteers', admin_controller_1.default.getReport);
router.get('/reports/volunteers/csv', admin_controller_1.default.getReportCSV);
router.get('/reports/volunteers/pdf', admin_controller_1.default.getReportPDF);
router.post('/announcements', (0, validate_middleware_1.validate)(validations_1.sendAnnouncementSchema), admin_controller_1.default.sendAnnouncement);
exports.default = router;

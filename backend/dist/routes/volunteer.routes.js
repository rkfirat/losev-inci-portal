"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const volunteer_controller_1 = require("../controllers/volunteer.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const validations_1 = require("../utils/validations");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Gönüllü (Volunteer) routes
router.use(auth_middleware_1.authenticate);
router.get('/my-hours', volunteer_controller_1.getUserHours);
router.post('/log-hours', (0, validate_middleware_1.validate)(validations_1.logVolunteerHourSchema), volunteer_controller_1.logHours);
router.get('/stats', volunteer_controller_1.getUserStats);
router.get('/certificate', volunteer_controller_1.getCertificate);
// Koordinatör (Coordinator) & Admin routes
router.get('/pending-hours', (0, auth_middleware_1.requireRole)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN), volunteer_controller_1.getPendingHours);
router.patch('/approve-hours/:id', (0, auth_middleware_1.requireRole)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN), (0, validate_middleware_1.validate)(validations_1.updateVolunteerHourStatusSchema), volunteer_controller_1.updateHourStatus);
exports.default = router;

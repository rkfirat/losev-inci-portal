"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coordinator_controller_1 = __importDefault(require("../controllers/coordinator.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Only coordinators and admins can access these
router.use(auth_middleware_1.authenticate, role_middleware_1.isCoordinator);
router.get('/hours/pending', coordinator_controller_1.default.getPendingHours);
router.patch('/hours/:id/status', coordinator_controller_1.default.updateHourStatus);
exports.default = router;

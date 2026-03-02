"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = __importDefault(require("../controllers/event.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const validations_1 = require("../utils/validations");
const router = (0, express_1.Router)();
router.get('/', event_controller_1.default.getAllEvents);
router.get('/:id', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(validations_1.eventIdParamSchema), event_controller_1.default.getEventById);
router.post('/:id/participate', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(validations_1.eventIdParamSchema), event_controller_1.default.participate);
router.delete('/:id/participate', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(validations_1.eventIdParamSchema), event_controller_1.default.cancelParticipation);
exports.default = router;

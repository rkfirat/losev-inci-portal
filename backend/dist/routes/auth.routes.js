"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validations_1 = require("../utils/validations");
const router = (0, express_1.Router)();
router.post('/register', (0, validate_middleware_1.validate)(validations_1.registerSchema), auth_controller_1.register);
router.post('/login', (0, validate_middleware_1.validate)(validations_1.loginSchema), auth_controller_1.login);
router.post('/refresh', (0, validate_middleware_1.validate)(validations_1.refreshSchema), auth_controller_1.refresh);
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.logout);
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.me);
router.patch('/push-token', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(validations_1.updatePushTokenSchema), auth_controller_1.updatePushToken);
// 42 OAuth
router.get('/42', auth_controller_1.get42AuthUrl);
router.get('/42/callback', auth_controller_1.handle42Callback);
exports.default = router;

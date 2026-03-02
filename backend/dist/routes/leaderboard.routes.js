"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaderboard_controller_1 = __importDefault(require("../controllers/leaderboard.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Protected routes
router.use(auth_middleware_1.authenticate);
router.get('/volunteers', leaderboard_controller_1.default.getTopVolunteers);
router.get('/teams', leaderboard_controller_1.default.getTeamLeaderboard);
exports.default = router;

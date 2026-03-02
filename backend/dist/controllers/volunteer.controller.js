"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCertificate = exports.getUserStats = exports.updateHourStatus = exports.getPendingHours = exports.getUserHours = exports.logHours = void 0;
const volunteer_service_1 = require("../services/volunteer.service");
const pdf_1 = require("../utils/pdf");
const database_1 = __importDefault(require("../config/database"));
const logHours = async (req, res, next) => {
    try {
        const userId = req.user.sub;
        const hour = await volunteer_service_1.VolunteerService.logHours(userId, req.body);
        res.status(201).json({
            success: true,
            data: hour,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logHours = logHours;
const getUserHours = async (req, res, next) => {
    try {
        const userId = req.user.sub;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await volunteer_service_1.VolunteerService.getUserHours(userId, page, limit);
        res.status(200).json({
            success: true,
            data: result.hours,
            meta: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserHours = getUserHours;
const getPendingHours = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await volunteer_service_1.VolunteerService.getPendingHours(page, limit);
        res.status(200).json({
            success: true,
            data: result.hours,
            meta: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPendingHours = getPendingHours;
const updateHourStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const approvedBy = req.user.sub;
        const updatedHour = await volunteer_service_1.VolunteerService.updateHourStatus(id, status, approvedBy);
        res.status(200).json({
            success: true,
            data: updatedHour,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateHourStatus = updateHourStatus;
const getUserStats = async (req, res, next) => {
    try {
        const userId = req.user.sub;
        const stats = await volunteer_service_1.VolunteerService.getUserStats(userId);
        res.status(200).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserStats = getUserStats;
const getCertificate = async (req, res, next) => {
    try {
        const userId = req.user.sub;
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { firstName: true, lastName: true }
        });
        if (!user) {
            return res.status(404).json({ success: false, error: { message: 'User not found' } });
        }
        const stats = await volunteer_service_1.VolunteerService.getUserStats(userId);
        if (stats.totalHours === 0) {
            return res.status(400).json({
                success: false,
                error: { message: 'Henüz onaylanmış gönüllülük saatiniz bulunmadığı için sertifika oluşturulamaz.' }
            });
        }
        pdf_1.PDFUtils.generateCertificate(res, user, stats);
    }
    catch (error) {
        next(error);
    }
};
exports.getCertificate = getCertificate;

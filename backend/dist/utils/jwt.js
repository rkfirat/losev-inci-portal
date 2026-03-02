"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getJwtSecret = () => process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_change_in_production';
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, getJwtSecret(), { expiresIn: '1h' });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, getRefreshSecret(), { expiresIn: '14d' });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, getJwtSecret());
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, getRefreshSecret());
};
exports.verifyRefreshToken = verifyRefreshToken;

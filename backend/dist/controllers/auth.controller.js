"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.handle42Callback = exports.get42AuthUrl = exports.updatePushToken = exports.me = exports.refresh = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const errors_1 = require("../errors");
const register = async (req, res, next) => {
    try {
        const result = await auth_service_1.AuthService.register(req.body);
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await auth_service_1.AuthService.login(email, password);
        const result = await auth_service_1.AuthService.createSession(user, {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
        });
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await auth_service_1.AuthService.refresh(refreshToken);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const me = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        if (!userId)
            throw new errors_1.UnauthorizedError('Unauthorized');
        const userData = await auth_service_1.AuthService.getUserProfile(userId);
        res.status(200).json({
            success: true,
            data: userData
        });
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
const updatePushToken = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        const { pushToken } = req.body;
        if (!userId)
            throw new errors_1.UnauthorizedError('Unauthorized');
        await auth_service_1.AuthService.updatePushToken(userId, pushToken);
        res.status(200).json({
            success: true,
            message: 'Push token updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePushToken = updatePushToken;
const get42AuthUrl = (req, res) => {
    const clientId = process.env.INTRA_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.INTRA_REDIRECT_URI || 'http://localhost:3000/api/v1/auth/42/callback');
    const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=public`;
    res.status(200).json({
        success: true,
        data: { authUrl }
    });
};
exports.get42AuthUrl = get42AuthUrl;
const handle42Callback = async (req, res, next) => {
    try {
        const { code } = req.query;
        if (!code)
            throw new errors_1.UnauthorizedError('Code not provided');
        const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: process.env.INTRA_CLIENT_ID,
                client_secret: process.env.INTRA_CLIENT_SECRET,
                code,
                redirect_uri: process.env.INTRA_REDIRECT_URI || 'http://localhost:3000/api/v1/auth/42/callback',
            }),
        });
        const tokenData = await tokenResponse.json();
        if (tokenData.error)
            throw new errors_1.UnauthorizedError(tokenData.error_description || 'Failed to exchange code');
        const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await userResponse.json();
        const user = await auth_service_1.AuthService.handle42User(userData);
        const result = await auth_service_1.AuthService.createSession(user, {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
        });
        const successRedirect = process.env.OAUTH_SUCCESS_REDIRECT || 'losev-inci-portal://auth/success';
        res.redirect(`${successRedirect}?accessToken=${result.tokens.accessToken}&refreshToken=${result.tokens.refreshToken}&userId=${user.id}`);
    }
    catch (error) {
        next(error);
    }
};
exports.handle42Callback = handle42Callback;
const database_1 = __importDefault(require("../config/database"));
const logout = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            if (req.user?.sub) {
                await database_1.default.session.deleteMany({ where: { userId: req.user.sub } });
            }
        }
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;

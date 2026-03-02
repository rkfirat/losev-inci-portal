"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../errors");
const SALT_ROUNDS = 12;
class AuthService {
    static async getRandomCoalition() {
        const coalitions = await database_1.default.coalition.findMany();
        if (coalitions.length === 0)
            return null;
        const randomIndex = Math.floor(Math.random() * coalitions.length);
        return coalitions[randomIndex].id;
    }
    static async register(data) {
        const { email, password, firstName, lastName, intraLogin, school, avatarUrl } = data;
        let existingUser = await database_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new errors_1.ConflictError('User with this email already exists');
        }
        if (intraLogin) {
            existingUser = await database_1.default.user.findUnique({ where: { intraLogin } });
            if (existingUser) {
                throw new errors_1.ConflictError('User with this intra login already exists');
            }
        }
        const passwordHash = password ? await bcryptjs_1.default.hash(password, SALT_ROUNDS) : null;
        const coalitionId = await this.getRandomCoalition();
        const user = await database_1.default.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                intraLogin,
                school,
                avatarUrl,
                role: 'VOLUNTEER',
                coalitionId,
            },
        });
        return this.createSession(user, { userAgent: 'Initial Registration', ipAddress: '0.0.0.0' });
    }
    static async login(email, password) {
        const user = await database_1.default.user.findUnique({
            where: { email },
            include: { coalition: true }
        });
        if (!user || user.deletedAt) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        if (password) {
            if (!user.passwordHash) {
                throw new errors_1.UnauthorizedError('Please login with 42 Intra');
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                throw new errors_1.UnauthorizedError('Invalid email or password');
            }
        }
        return user;
    }
    static async createSession(user, info) {
        const accessToken = (0, jwt_1.generateAccessToken)({ sub: user.id, email: user.email, role: user.role });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ sub: user.id, tokenId: user.id });
        await database_1.default.session.create({
            data: {
                userId: user.id,
                refreshToken,
                expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                userAgent: info.userAgent,
                ipAddress: info.ipAddress,
            }
        });
        await database_1.default.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                coalition: user.coalition
            },
            tokens: { accessToken, refreshToken, expiresIn: 3600 },
        };
    }
    static async refresh(refreshToken) {
        const session = await database_1.default.session.findUnique({ where: { refreshToken } });
        if (!session || session.expiresAt < new Date()) {
            if (session)
                await database_1.default.session.delete({ where: { id: session.id } });
            throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
        }
        const user = await database_1.default.user.findUnique({ where: { id: session.userId } });
        if (!user || user.deletedAt)
            throw new errors_1.UnauthorizedError('User not found or inactive');
        const newAccessToken = (0, jwt_1.generateAccessToken)({ sub: user.id, email: user.email, role: user.role });
        const newRefreshToken = (0, jwt_1.generateRefreshToken)({ sub: user.id, tokenId: user.id });
        await database_1.default.session.update({
            where: { id: session.id },
            data: { refreshToken: newRefreshToken, expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }
        });
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: 3600
        };
    }
    static async getUserProfile(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            include: { coalition: true }
        });
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        const { passwordHash, ...userData } = user;
        return userData;
    }
    static async updatePushToken(userId, pushToken) {
        return await database_1.default.user.update({
            where: { id: userId },
            data: { pushToken }
        });
    }
    static async handle42User(userData) {
        const email = userData.email;
        const intraLogin = userData.login;
        const firstName = userData.first_name;
        const lastName = userData.last_name;
        const avatarUrl = userData.image?.link;
        const school = userData.campus?.[0]?.name || '42';
        let user = await database_1.default.user.findUnique({ where: { email } });
        if (!user)
            user = await database_1.default.user.findUnique({ where: { intraLogin } });
        if (user) {
            user = await database_1.default.user.update({
                where: { id: user.id },
                data: {
                    intraLogin,
                    school,
                    avatarUrl: user.avatarUrl || avatarUrl,
                }
            });
        }
        else {
            const coalitionId = await this.getRandomCoalition();
            user = await database_1.default.user.create({
                data: {
                    email,
                    intraLogin,
                    school,
                    firstName,
                    lastName,
                    avatarUrl,
                    role: 'VOLUNTEER',
                    coalitionId,
                }
            });
        }
        return user;
    }
}
exports.AuthService = AuthService;

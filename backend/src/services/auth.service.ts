import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../errors';

const SALT_ROUNDS = 12;

export class AuthService {
  static async getRandomCoalition() {
    const coalitions = await prisma.coalition.findMany();
    if (coalitions.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * coalitions.length);
    return coalitions[randomIndex].id;
  }

  static async register(data: { email: string; password?: string; firstName?: string; lastName?: string; intraLogin?: string; school?: string; avatarUrl?: string }) {
    const { email, password, firstName, lastName, intraLogin, school, avatarUrl } = data;

    let existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    if (intraLogin) {
      existingUser = await prisma.user.findUnique({ where: { intraLogin } });
      if (existingUser) {
        throw new ConflictError('User with this intra login already exists');
      }
    }

    const passwordHash = password ? await bcrypt.hash(password, SALT_ROUNDS) : null;
    const coalitionId = await this.getRandomCoalition();

    const user = await prisma.user.create({
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

  static async login(email: string, password?: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { coalition: true }
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (password) {
      if (!user.passwordHash) {
        throw new UnauthorizedError('Please login with 42 Intra');
      }
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
      }
    }

    return user;
  }

  static async createSession(user: any, info: { userAgent?: string; ipAddress?: string }) {
    const accessToken = generateAccessToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ sub: user.id, tokenId: user.id });

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        userAgent: info.userAgent,
        ipAddress: info.ipAddress,
      }
    });

    await prisma.user.update({
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

  static async refresh(refreshToken: string) {
    const session = await prisma.session.findUnique({ where: { refreshToken } });

    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.deletedAt) throw new UnauthorizedError('User not found or inactive');

    const newAccessToken = generateAccessToken({ sub: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ sub: user.id, tokenId: user.id });

    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newRefreshToken, expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600
    };
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { coalition: true }
    });

    if (!user) throw new NotFoundError('User not found');

    const { passwordHash, ...userData } = user;
    return userData;
  }

  static async updatePushToken(userId: string, pushToken: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { pushToken }
    });
  }

  static async handle42User(userData: any) {
    const email = userData.email;
    const intraLogin = userData.login;
    const firstName = userData.first_name;
    const lastName = userData.last_name;
    const avatarUrl = userData.image?.link;
    const school = userData.campus?.[0]?.name || '42';

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) user = await prisma.user.findUnique({ where: { intraLogin } });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          intraLogin,
          school,
          avatarUrl: user.avatarUrl || avatarUrl,
        }
      });
    } else {
      const coalitionId = await this.getRandomCoalition();
      user = await prisma.user.create({
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

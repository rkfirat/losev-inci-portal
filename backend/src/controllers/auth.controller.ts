import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UnauthorizedError } from '../errors';
import { AuthRequest } from '../middlewares/auth.middleware';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await AuthService.login(email, password);
    const result = await AuthService.createSession(user, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthService.refresh(refreshToken);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const userData = await AuthService.getUserProfile(userId);

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

export const updatePushToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.sub;
    const { pushToken } = req.body;

    if (!userId) throw new UnauthorizedError('Unauthorized');

    await AuthService.updatePushToken(userId, pushToken);

    res.status(200).json({
      success: true,
      message: 'Push token updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const get42AuthUrl = (req: Request, res: Response) => {
  const clientId = process.env.INTRA_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.INTRA_REDIRECT_URI || 'http://localhost:3000/api/v1/auth/42/callback');
  
  const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=public`;
  
  res.status(200).json({
    success: true,
    data: { authUrl }
  });
};

export const handle42Callback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query;
    if (!code) throw new UnauthorizedError('Code not provided');

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
    if (tokenData.error) throw new UnauthorizedError(tokenData.error_description || 'Failed to exchange code');

    const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();
    const user = await AuthService.handle42User(userData);

    const result = await AuthService.createSession(user, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    const successRedirect = process.env.OAUTH_SUCCESS_REDIRECT || 'losev-inci-portal://auth/success';
    res.redirect(`${successRedirect}?accessToken=${result.tokens.accessToken}&refreshToken=${result.tokens.refreshToken}&userId=${user.id}`);

  } catch (error) {
    next(error);
  }
};

import prisma from '../config/database';

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
       if (req.user?.sub) {
          await prisma.session.deleteMany({ where: { userId: req.user.sub } });
       }
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

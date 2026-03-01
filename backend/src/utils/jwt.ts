import jwt, { Algorithm, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { env } from '../config/env';

const ALGORITHM: Algorithm = 'HS256';
const SECRET = env.JWT_PRIVATE_KEY;

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    algorithm: ALGORITHM,
    expiresIn: env.JWT_ACCESS_EXPIRATION as unknown as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, SECRET, options);
}

export function generateRefreshToken(userId: string): string {
  const payload: RefreshTokenPayload = { userId, type: 'refresh' };
  const options: SignOptions = {
    algorithm: ALGORITHM,
    expiresIn: env.JWT_REFRESH_EXPIRATION as unknown as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const options: VerifyOptions = { algorithms: [ALGORITHM] };
  return jwt.verify(token, SECRET, options) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const options: VerifyOptions = { algorithms: [ALGORITHM] };
  const payload = jwt.verify(token, SECRET, options) as RefreshTokenPayload;
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return payload;
}

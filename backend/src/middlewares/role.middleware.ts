import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ForbiddenError } from '../errors';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
};

export const isAdmin = requireRole(UserRole.ADMIN);
export const isCoordinator = requireRole(UserRole.COORDINATOR, UserRole.ADMIN);

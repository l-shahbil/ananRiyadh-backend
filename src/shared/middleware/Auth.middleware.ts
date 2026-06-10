import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/error.js';
import type { JwtPayload } from '../types/jwt.types.js';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('لم يتم تقديم رمز المصادقة'));
  }

  try {
    const token = authHeader.split(' ')[1];
    if (!token) return next(new UnauthorizedError('لم يتم تقديم رمز المصادقة'));

    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    req.user = {
      id: payload.userId,
      role: payload.role,
      name: payload.name,
      isAdmin: payload.role === 'admin',
    };

    next();
  } catch {
    next(new UnauthorizedError('رمز المصادقة غير صالح أو منتهي'));
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new UnauthorizedError('ليس لديك صلاحية'));
    }
    next();
  };
};
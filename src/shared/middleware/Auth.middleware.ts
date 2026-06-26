import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/error.js';
import type { JwtPayload } from '../types/jwt.types.js';
import { prisma } from '../../shared/config/prisma.js';

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('لم يتم تقديم رمز المصادقة'));
  }

  try {
    const token = authHeader.split(' ')[1];
    if (!token) return next(new UnauthorizedError('لم يتم تقديم رمز المصادقة'));

    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, name: true, status: true },
    });

    if (!user) return next(new UnauthorizedError('المستخدم غير موجود'));
    if (user.status === 'suspended') return next(new UnauthorizedError('الحساب موقوف'));

    req.user = {
      id: user.id,
      role: user.role,
      name: user.name,
      isAdmin: user.role === 'admin',
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
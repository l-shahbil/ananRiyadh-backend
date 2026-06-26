import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../shared/config/prisma.js';
import { UnauthorizedError, NotFoundError } from '../../shared/utils/error.js';
import { UserStatus } from '@prisma/client';
import type { JwtPayload } from '../../shared/types/jwt.types.js';

interface LoginInput {
  email: string;
  password: string;
}

export const authService = {

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });

    if (!user) throw new UnauthorizedError('بيانات الدخول غير صحيحة');

    if (user.status === UserStatus.suspended) {
      throw new UnauthorizedError('الحساب موقوف، تواصل مع الأدمن');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedError('بيانات الدخول غير صحيحة');

    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
      name: user.name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) ?? '7d',
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        nameEn:true,
        email: true,
        phone: true,
        whatsappNumber:true,
        telegramChatId:true,
        role: true,
        status: true,
        createAt: true,
        _count: { select: { listings: true } },
      },
    });

    if (!user) throw new NotFoundError('المستخدم غير موجود');
    return user;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) throw new NotFoundError('المستخدم غير موجود');

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new UnauthorizedError('كلمة المرور الحالية غير صحيحة');

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashed }, 
    });
  }
}
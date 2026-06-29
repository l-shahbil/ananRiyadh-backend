import { prisma } from '../../shared/config/prisma.js';
import { Role, UserStatus } from '@prisma/client';
import { AppError } from '../../shared/utils/error.js';
import bcrypt from 'bcrypt';
import type { CreateStaffInput, UpdateStaffInput } from './staff.validator.js';

export const staffService = {

  async getStaffList() {
    return await prisma.user.findMany({
      where: { role: Role.staff },
      select: {
        id: true,
        name: true,
        nameEn: true,
        email: true,
        phone: true,
        whatsappNumber: true,
        status: true,
        createAt: true,
        _count: {
          select: { listings: true },
        },
      },
      orderBy: { createAt: 'desc' },
    });
  },

  async getStaffById(staffId: string) {
    const staff = await prisma.user.findUnique({
      where: { id: staffId, role: Role.staff },
      select: {
        id: true,
        name: true,
        nameEn: true,
        email: true,
        phone: true,
        whatsappNumber: true,
        status: true,
        createAt: true,
        listings: {
          select: { status: true },
        },
      },
    });

    if (!staff) throw new AppError('الموظف غير موجود', 404);

    const stats = { active: 0, hidden: 0, completed: 0, expired: 0 };
    for (const listing of staff.listings) {
      stats[listing.status]++;
    }

    const { listings, ...staffData } = staff;
    return { ...staffData, stats };
  },

  async createStaff(input: CreateStaffInput) {
    const exists = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          { phone: input.phone },
        ],
      },
    });

    if (exists?.email === input.email) throw new AppError('البريد الإلكتروني مستخدم بالفعل', 409);
    if (exists?.phone === input.phone) throw new AppError('رقم الجوال مستخدم بالفعل', 409);

    const passwordHash = await bcrypt.hash(input.password, 10);

    return await prisma.user.create({
      data: {
        name: input.name,
        nameEn: input.nameEn ?? null,
        email: input.email,
        passwordHash,
        phone: input.phone ?? null,
        whatsappNumber: input.whatsappNumber ?? null,
        telegramChatId: input.telegramChatId ?? null,
        role: Role.staff,
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        email: true,
        phone: true,
        status: true,
        createAt: true,
      },
    });
  },

async updateStaff(
  staffId: string,
  input: UpdateStaffInput,
  requestingUser: { id: string; role: Role }
) {
  if (requestingUser.role === Role.staff && requestingUser.id !== staffId) {
    throw new AppError('لا يمكنك تعديل بيانات موظف آخر', 403);
  }

  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff) throw new AppError('المستخدم غير موجود', 404);

  if (input.email || input.phone) {
    const conditions = [];
    if (input.email) conditions.push({ email: input.email });
    if (input.phone) conditions.push({ phone: input.phone });

    const conflict = await prisma.user.findFirst({
      where: {
        OR: conditions,
        NOT: { id: staffId },
      },
    });

    if (conflict?.email && conflict.email === input.email) throw new AppError('البريد الإلكتروني مستخدم بالفعل', 409);
    if (conflict?.phone && conflict.phone === input.phone) throw new AppError('رقم الجوال مستخدم بالفعل', 409);
  }

  const data: Record<string, unknown> = {};

  if (input.name)           data.name           = input.name;
  if (input.nameEn)         data.nameEn         = input.nameEn;
  if (input.email)          data.email          = input.email;
  if (input.phone)          data.phone          = input.phone;
  if (input.whatsappNumber) data.whatsappNumber = input.whatsappNumber;
  if (input.telegramChatId) data.telegramChatId = input.telegramChatId;
  if (input.password)       data.passwordHash   = await bcrypt.hash(input.password, 10);

  return await prisma.user.update({
    where: { id: staffId },
    data,
    select: {
      id: true,
      name: true,
      nameEn: true,
      email: true,
      phone: true,
      status: true,
      updateAt: true,
    },
  });
},

async suspendStaff(staffId: string) {
  const staff = await prisma.user.findUnique({ where: { id: staffId, role: Role.staff } });
  if (!staff) throw new AppError('الموظف غير موجود', 404);
  if (staff.status === UserStatus.suspended) throw new AppError('الموظف موقوف بالفعل', 400);

  const admin = await prisma.user.findFirst({ where: { role: Role.admin } });
  if (!admin) throw new AppError('الأدمن غير موجود', 500);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: staffId },
      data: { status: UserStatus.suspended },
    }),
    prisma.listing.updateMany({
      where: { ownerId: staffId },
      data: {
        phoneOverride: admin.phone,
        whatsappOverride: admin.whatsappNumber,
      },
    }),
  ]);

  return { id: staffId, status: UserStatus.suspended };
},

async reactivateStaff(staffId: string) {
  const staff = await prisma.user.findUnique({ where: { id: staffId, role: Role.staff } });
  if (!staff) throw new AppError('الموظف غير موجود', 404);
  if (staff.status === UserStatus.active) throw new AppError('الموظف نشط بالفعل', 400);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: staffId },
      data: { status: UserStatus.active },
    }),
    prisma.listing.updateMany({
      where: { ownerId: staffId },
      data: {
        phoneOverride: null,
        whatsappOverride: null,
      },
    }),
  ]);

  return { id: staffId, status: UserStatus.active };
},

  async deleteStaff(staffId: string) {
    const staff = await prisma.user.findUnique({
      where: { id: staffId, role: Role.staff },
      include: { _count: { select: { listings: true } } },
    });

    if (!staff) throw new AppError('الموظف غير موجود', 404);

    if (staff._count.listings > 0) {
      throw new AppError('لا يمكن حذف موظف لديه إعلانات — قم بحذف إعلاناته أولاً', 400);
    }

    await prisma.user.delete({ where: { id: staffId } });
  },
};
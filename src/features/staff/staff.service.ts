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

    // build stats from listings array
    const stats = {
      active: 0,
      hidden: 0,
      completed: 0,
      expired: 0,
    };

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
        email: true,
        phone: true,
        status: true,
        createAt: true,
      },
    });
  },

 async updateStaff(staffId: string, input: UpdateStaffInput) {
  const staff = await prisma.user.findUnique({ where: { id: staffId, role: Role.staff } });
  if (!staff) throw new AppError('الموظف غير موجود', 404);

  const data: Record<string, unknown> = {};

  if (input.name)           data.name           = input.name;
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

    return await prisma.user.update({
      where: { id: staffId },
      data: { status: UserStatus.suspended },
      select: { id: true, status: true },
    });
  },

  async reactivateStaff(staffId: string) {
    const staff = await prisma.user.findUnique({ where: { id: staffId, role: Role.staff } });
    if (!staff) throw new AppError('الموظف غير موجود', 404);
    if (staff.status === UserStatus.active) throw new AppError('الموظف نشط بالفعل', 400);

    return await prisma.user.update({
      where: { id: staffId },
      data: { status: UserStatus.active },
      select: { id: true, status: true },
    });
  },

  async deleteStaff(staffId: string) {
    const staff = await prisma.user.findUnique({
      where: { id: staffId, role: Role.staff },
      include: { _count: { select: { listings: true } } },
    });

    if (!staff) throw new AppError('الموظف غير موجود', 404);

    // prevent deletion if staff has listings — transfer them first
    if (staff._count.listings > 0) {
      throw new AppError('لا يمكن حذف موظف لديه إعلانات — قم بنقل إعلاناته أولاً', 400);
    }

    await prisma.user.delete({ where: { id: staffId } });
  },
};
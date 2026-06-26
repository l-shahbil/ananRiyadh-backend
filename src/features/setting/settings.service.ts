// settings.service.ts
import { prisma } from '../../shared/config/prisma.js';
import { AppError } from '../../shared/utils/error.js';
import type { UpdateSettingsInput } from './settings.validator.js';

export const settingsService = {

  async getSettings() {
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) throw new AppError('إعدادات الموقع غير موجودة', 404);

    return settings;
  },

 async updateSettings(data: UpdateSettingsInput) {
  return prisma.settings.update({
    where: { id: 'default' },
    data: {
      ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
      ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.addressAr !== undefined && { addressAr: data.addressAr }),
      ...(data.addressEn !== undefined && { addressEn: data.addressEn }),
      ...(data.descriptionAr !== undefined && { descriptionAr: data.descriptionAr }),
      ...(data.descriptionEn !== undefined && { descriptionEn: data.descriptionEn }),
      ...(data.instagram !== undefined && { instagram: data.instagram }),
      ...(data.tiktok !== undefined && { tiktok: data.tiktok }),
      ...(data.snapshat !== undefined && { snapshat: data.snapshat }),
      ...(data.X !== undefined && { X: data.X }),
    },
  });
},
};
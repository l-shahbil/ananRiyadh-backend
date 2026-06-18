// settings.validator.ts
import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    nameAr:        z.string().optional(),
    nameEn:        z.string().optional(),
    phone:         z.string().optional(),
    whatsapp:      z.string().optional(),
    email:         z.string().email('البريد الإلكتروني غير صالح').optional(),
    addressAr:     z.string().optional(),
    addressEn:     z.string().optional(),
    descriptionAr: z.string().optional(),
    descriptionEn: z.string().optional(),
    instagram:     z.string().optional(),
    tiktok:        z.string().optional(),
    snapshat:      z.string().optional(),
  }),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>['body'];
import { z } from 'zod';

export const createOfferSchema = z.object({
  body: z.object({
    content: z.string().nonempty('المحتوى مطلوب').max(1000, 'الحد الأقصى 1000 حرف'),
    imageUrl: z.string().url('رابط الصورة غير صالح').optional(),
  }),
});

export const updateOfferSchema = z.object({
  body: z.object({
    content: z.string().nonempty('المحتوى مطلوب').max(1000, 'الحد الأقصى 1000 حرف').optional(),
    imageUrl: z.string().url('رابط الصورة غير صالح').nullable().optional(),
  }),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>['body'];
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>['body'];
import { z } from 'zod';

export const contactSchema = z.object({
  body: z.object({
    name:    z.string().min(2, 'الاسم مطلوب'),
    email:   z.string().email('البريد الإلكتروني غير صالح').optional(),
    phone:   z.string().min(9, 'رقم الجوال غير صالح'),
    message: z.string().min(5, 'الرسالة مطلوبة'),
  }),
});

export type ContactInput = z.infer<typeof contactSchema>['body'];
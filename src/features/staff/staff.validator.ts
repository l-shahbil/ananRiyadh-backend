import z from "zod"

export const createStaffSchema =z.object({
    body:z.object({
        name: z.string({error:"الاسم مطلوب"}).nonempty('الاسم مطلوب'),
        email: z.string({error:"البريد الإلكتروني مطلوب"}).email('البريد الإلكتروني غير صالح'),
        password: z.string({error:"كلمة المرور مطلوبة"}).min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
        phone: z.string({error:"رقم الجوال مطلوب"}),
        whatsappNumber: z.string().optional(),
        telegramChatId:z.string().optional()
    })
})

export const updateStaffSchema = z.object({
    body:z.object({
        name: z.string().optional(),
        email: z.string().email('البريد الإلكتروني غير صالح').optional(),
        password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').optional(),
        phone: z.string().optional(),
        whatsappNumber: z.string().optional(),
        telegramChatId: z.string().optional(),

    })
})

export type  CreateStaffInput =z.infer<typeof createStaffSchema>['body']
export type  UpdateStaffInput =z.infer<typeof updateStaffSchema>['body']
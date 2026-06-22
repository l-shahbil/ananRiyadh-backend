import z from "zod"

export const loginSchema = z.object({
        body:z.object({
            email:z.string()
                    .nonempty("البريد الإلكتروني مطلوب")
                    .email("صيغة البريد الإلكتروني غير صحيحة")
                    .toLowerCase(),
            password:z.string()
                        .nonempty('كلمة المرور مطلوبة')
                        .min(6,"كلمة المرور يجب ان تكون 6 احرف على الأقل")
        })
})


export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .nonempty('كلمة المرور الحالية مطلوبة'),

    newPassword: z
      .string()
      .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل')
      .max(64, 'كلمة المرور الجديدة يجب ألا تتجاوز 64 حرفًا')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*])[A-Za-z\d!@#$%&*]+$/,
        'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم ورمز خاص من (!,@,#,$,%,&,*), ولا تحتوي على مسافات'
      ),
  }),
});
 
export type LoginInput = z.infer<typeof loginSchema>['body'];
import { z } from 'zod'

export const createCitySchema = z.object({
  body: z.object({
    nameAr: z.string().min(1),
    nameEn: z.string().min(1),
  }),
})

export const updateCitySchema = z.object({
  body: z.object({
    nameAr: z.string().min(1).optional(),
    nameEn: z.string().min(1).optional(),
  }),
})

export const createDistrictSchema = z.object({
  body: z.object({
    nameAr: z.string().min(1),
    nameEn: z.string().min(1),
    cityId: z.string().min(1),
  }),
})

export const updateDistrictSchema = z.object({
  body: z.object({
    nameAr: z.string().min(1).optional(),
    nameEn: z.string().min(1).optional(),
  }),
})

export type CreateCityInput = z.infer<typeof createCitySchema>['body']
export type UpdateCityInput = z.infer<typeof updateCitySchema>['body']
export type CreateDistrictInput = z.infer<typeof createDistrictSchema>['body']
export type UpdateDistrictInput = z.infer<typeof updateDistrictSchema>['body']
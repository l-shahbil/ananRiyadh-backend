import { z } from 'zod'

export const createCitySchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
})

export const updateCitySchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
})

export const createDistrictSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  cityId: z.string().min(1),
})

export const updateDistrictSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
})

export type CreateCityInput = z.infer<typeof createCitySchema>
export type UpdateCityInput = z.infer<typeof updateCitySchema>
export type CreateDistrictInput = z.infer<typeof createDistrictSchema>
export type UpdateDistrictInput = z.infer<typeof updateDistrictSchema>
import {prisma} from '../../shared/config/prisma.js'
import { AppError } from '../../shared/utils/error.js'
import type { CreateCityInput, UpdateCityInput, CreateDistrictInput, UpdateDistrictInput } from './locations.validator.js'

export const locationsService = {

  // ===== Cities =====

  async getCities() {
    return prisma.city.findMany({
      orderBy: { nameAr: 'asc' },
    })
  },

  async createCity(data: CreateCityInput) {
    return prisma.city.create({data})
  },

  async updateCity(id: string, data: UpdateCityInput) {
    const city = await prisma.city.findUnique({ where: { id } })
    if (!city) throw new AppError('المدينة غير موجودة', 404)
    return prisma.city.update({ where: { id }, 
    data:{
        ...(data.nameAr !==undefined &&{nameAr:data.nameAr}),
        ...(data.nameEn !==undefined &&{nameEn:data.nameEn})
    }

     })
  },

  async deleteCity(id: string) {
    const city = await prisma.city.findUnique({ where: { id } })
    if (!city) throw new AppError('المدينة غير موجودة', 404)
    return prisma.city.delete({ where: { id } })
  },

  // ===== Districts =====

async getDistrictsByCity(cityId: string, withCount = false) {
  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) throw new AppError('المدينة غير موجودة', 404);

  return prisma.district.findMany({
    where: { cityId },
    orderBy: { nameAr: 'asc' },
    ...(withCount && {
      include: { _count: { select: { listings: true } } },
    }),
  });
},
  async createDistrict(data: CreateDistrictInput) {
    const city = await prisma.city.findUnique({ where: { id: data.cityId } })
    if (!city) throw new AppError('المدينة غير موجودة', 404)
    return prisma.district.create({ data })
  },

  async updateDistrict(id: string, data: UpdateDistrictInput) {
    const district = await prisma.district.findUnique({ where: { id } })
    if (!district) throw new AppError('الحي غير موجود', 404)
    return prisma.district.update({ where: { id },
            data:{
                 ...(data.nameAr !==undefined &&{nameAr:data.nameAr}),
                 ...(data.nameEn !==undefined &&{nameEn:data.nameEn})
                }})
  },

  async deleteDistrict(id: string) {
    const district = await prisma.district.findUnique({ where: { id } })
    if (!district) throw new AppError('الحي غير موجود', 404)
    return prisma.district.delete({ where: { id } })
  },
}
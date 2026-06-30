import type { Request, Response, NextFunction } from 'express'
import { locationsService } from './locations.service.js'
import { successResponse } from '../../shared/utils/response.js'

export const locationsController = {

  // ===== Cities =====

  async getCities(req: Request, res: Response, next: NextFunction) {
    try {
      const cities = await locationsService.getCities()
      res.json(successResponse(cities))
    } catch (error) {
      next(error)
    }
  },

  async createCity(req: Request, res: Response, next: NextFunction) {
    try {
      const city = await locationsService.createCity(req.body)
      res.status(201).json(successResponse(city))
    } catch (error) {
      next(error)
    }
  },

 async updateCity(req: Request, res: Response, next: NextFunction) {
  try {
    const city = await locationsService.updateCity(String(req.params.id), req.body)
    res.json(successResponse(city))
  } catch (error) {
    next(error)
  }
},

async deleteCity(req: Request, res: Response, next: NextFunction) {
  try {
    await locationsService.deleteCity(String(req.params.id))
    res.json(successResponse(null, 'تم حذف المدينة'))
  } catch (error) {
    next(error)
  }
},
 async createDistrict(req: Request, res: Response, next: NextFunction) {
    try {
      const district = await locationsService.createDistrict(req.body)
      res.status(201).json(successResponse(district))
    } catch (error) {
      next(error)
    }
  },
async getDistrictsByCity(req: Request, res: Response, next: NextFunction) {
  try {
    const withCount = req.query.withCount === 'true';
    const districts = await locationsService.getDistrictsByCity(String(req.params.cityId), withCount);
    res.json(successResponse(districts));
  } catch (error) {
    next(error);
  }
},

async updateDistrict(req: Request, res: Response, next: NextFunction) {
  try {
    const district = await locationsService.updateDistrict(String(req.params.id), req.body)
    res.json(successResponse(district))
  } catch (error) {
    next(error)
  }
},

async deleteDistrict(req: Request, res: Response, next: NextFunction) {
  try {
    await locationsService.deleteDistrict(String(req.params.id))
    res.json(successResponse(null, 'تم حذف الحي'))
  } catch (error) {
    next(error)
  }
},
}
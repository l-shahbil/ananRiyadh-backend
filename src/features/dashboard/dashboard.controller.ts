// dashboard.controller.ts
import type { Request, Response, NextFunction } from 'express'
import { dashboardService } from './dashboard.service.js'
import { successResponse } from '../../shared/utils/response.js'

export const dashboardController = {

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getDashboardStats()
      res.json(successResponse(stats))
    } catch (error) {
      next(error)
    }
  },
}
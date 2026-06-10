// settings.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service.js';
import { successResponse } from '../../shared/utils/response.js';

export const settingsController = {

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getSettings();
      res.json(successResponse(settings));
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.updateSettings(req.body);
      res.json(successResponse(settings, 'تم تحديث الإعدادات بنجاح'));
    } catch (error) {
      next(error);
    }
  },
};
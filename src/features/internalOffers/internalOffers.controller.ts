import type { Request, Response, NextFunction } from 'express';
import { internalOffersService } from './internalOffers.service.js';
import { successResponse } from '../../shared/utils/response.js';

export const internalOffersController = {

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const offers = await internalOffersService.getAll();
      res.json(successResponse(offers));
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file as Express.Multer.File | undefined;
      const offer = await internalOffersService.create(
        req.user!.id,
        req.user!.name,
        req.body,
        file
      );
      res.status(201).json(successResponse(offer, 'تم نشر العرض بنجاح'));
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file as Express.Multer.File | undefined;
      const offer = await internalOffersService.update(
        String(req.params.id),
        req.user!.id,
        req.body,
        file
      );
      res.json(successResponse(offer, 'تم تعديل العرض بنجاح'));
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await internalOffersService.delete(String(req.params.id),req.user!.id, req.user!.isAdmin);
      res.json(successResponse(null, 'تم حذف العرض بنجاح'));
    } catch (error) {
      next(error);
    }
  },
};
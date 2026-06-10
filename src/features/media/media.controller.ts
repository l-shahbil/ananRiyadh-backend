import type { Request, Response, NextFunction } from 'express';
import { mediaService } from './media.service.js';
import { successResponse } from '../../shared/utils/response.js';
import { AppError } from '../../shared/utils/error.js';

export const mediaController = {

  async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) throw new AppError('لم يتم رفع أي صورة', 422);

      const images = await mediaService.uploadImages(
        String(req.params.listingId),
        files
      );
      res.status(201).json(successResponse(images));
    } catch (error) {
      next(error);
    }
  },

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mediaService.deleteImage(
        String(req.params.imageId),
        String(req.params.listingId)
      );
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async reorderImages(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mediaService.reorderImages(
        String(req.params.listingId),
        req.body.orderedIds as string[]
      );
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },
};
import type { Request, Response, NextFunction } from "express"
import { requestService } from "./request.service.js"
import { successResponse } from '../../shared/utils/response.js'
import {Role,RequestStatus,ListingType,ListingCategory,RequestType} from "@prisma/client"

export const requestController = {

  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await requestService.createRequest(req.body)
      res.status(201).json(successResponse(request));
    } catch (error) {
      next(error)
    }
  },

async getRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const page         = parseInt(req.query.page  as string) || 1;
    const limit        = parseInt(req.query.limit as string) || 10;
    const type         = req.query.type         as RequestType     | undefined;
    const category     = req.query.category     as ListingCategory | undefined;
    const propertyType = req.query.propertyType as ListingType     | undefined;
    const status       = req.query.status       as RequestStatus   | undefined;
    const assignedToMe = req.query.assignedToMe === 'true';

    const result = await requestService.getRequests({
      role:        req.user!.role as Role,
      userId:      req.user!.id,
      page,
      limit,
      type,
      category,
      propertyType,
      status,
      assignedToMe,
    });

    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
},

  async markAsDone(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await requestService.markAsDone(
        String(req.params.id),
        req.user!.id,
        req.user!.role as Role
      );
      res.json(successResponse(request));
    } catch (error) {
      next(error);
    }
  },
}
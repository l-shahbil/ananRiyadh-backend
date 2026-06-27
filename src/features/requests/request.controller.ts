import type { Request, Response, NextFunction } from "express"
import { requestService } from "./request.service.js"
import { successResponse } from '../../shared/utils/response.js'
import { Role } from "@prisma/client"

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
    const page  = parseInt(req.query.page  as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    const result = await requestService.getRequests(req.user!.role as Role, page, limit);
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
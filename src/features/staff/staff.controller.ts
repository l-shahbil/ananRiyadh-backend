import type { Request, Response } from 'express';
import { staffService } from './staff.service.js';
import { successResponse } from '../../shared/utils/response.js';

export const staffController = {

  async getStaffList(req: Request, res: Response) {
    const data = await staffService.getStaffList();
    res.json(successResponse(data));
  },

  async getStaffById(req: Request, res: Response) {
    const data = await staffService.getStaffById(String(req.params.id));
    res.json(successResponse(data));
  },

  async createStaff(req: Request, res: Response) {
    const data = await staffService.createStaff(req.body);
    res.status(201).json(successResponse(data, 'تم إنشاء الموظف بنجاح'));
  },

  async updateStaff(req: Request, res: Response) {
    const data = await staffService.updateStaff(String(req.params.id), req.body);
    res.json(successResponse(data, 'تم تحديث بيانات الموظف'));
  },

  async suspendStaff(req: Request, res: Response) {
    const data = await staffService.suspendStaff(String(req.params.id));
    res.json(successResponse(data, 'تم تعليق الموظف'));
  },

  async reactivateStaff(req: Request, res: Response) {
    const data = await staffService.reactivateStaff(String(req.params.id));
    res.json(successResponse(data, 'تم تفعيل الموظف'));
  },

  async deleteStaff(req: Request, res: Response) {
    await staffService.deleteStaff(String(req.params.id));
    res.json(successResponse(null, 'تم حذف الموظف'));
  },

};
import type { Request, Response, NextFunction } from 'express';
import { authService } from '../auth/auth.service.js';
import { successResponse } from '../../shared/utils/response.js';


export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(successResponse(result, 'تم تسجيل الدخول بنجاح'));
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getProfile(req.user!.id);
    res.status(200).json(successResponse(user));
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.id, currentPassword, newPassword);
    res.status(200).json(successResponse(null, 'تم تغيير كلمة المرور بنجاح'));
  } catch (error) {
    next(error);
  }
};
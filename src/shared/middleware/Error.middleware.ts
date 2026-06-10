import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.js';
import { errorResponse } from '../utils/response.js';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(errorResponse(err.message, err.code));
  }

  // Handle unknown errors — never expose details in production
  console.error(err);
  return res.status(500).json(errorResponse('حدث خطأ غير متوقع'));
};
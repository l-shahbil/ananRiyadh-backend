import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorResponse } from '../utils/response.js';

export const validate = (schema: z.ZodObject<z.ZodRawShape>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body??{}, params: req.params, query: req.query });

    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'بيانات غير صحيحة';
      return res.status(422).json(errorResponse(message, result.error.issues));
    }

    // Replace with coerced data
    req.body   = result.data.body;

    next();
  };
};
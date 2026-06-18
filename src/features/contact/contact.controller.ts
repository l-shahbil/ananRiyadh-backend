import type { Request, Response } from 'express';
import { contactService } from './contact.service.js';
import { successResponse } from '../../shared/utils/response.js';
import type { ContactInput } from './contact.validator.js';

export const contactController = {
  async send(req: Request, res: Response) {
    await contactService.sendContactMessage(req.body as ContactInput);
    successResponse(res, 'تم إرسال رسالتك بنجاح');
  },
};
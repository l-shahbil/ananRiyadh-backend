import { Router } from 'express';
import { contactController } from './contact.controller.js';
import { validate } from '../../shared/middleware/Validate.middleware.js';
import { contactSchema } from './contact.validator.js';

const router = Router();

router.post('/', validate(contactSchema), contactController.send);

export default router;
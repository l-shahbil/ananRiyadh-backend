// settings.routes.ts
import { Router } from 'express';
import { authenticate, authorizeRoles } from '../../shared/middleware/Auth.middleware.js';
import { validate } from '../../shared/middleware/Validate.middleware.js';
import { updateSettingsSchema } from './settings.validator.js';
import { settingsController } from './settings.controller.js';
import {Role} from "@prisma/client"


const router = Router();

// Public — frontend uses this to display office info
router.get('/', settingsController.getSettings);

// Admin only
router.patch('/', authenticate, authorizeRoles(Role.admin), validate(updateSettingsSchema), settingsController.updateSettings);

export default router;
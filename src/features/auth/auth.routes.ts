import { Router } from 'express';
import { login, getProfile, changePassword } from './auth.controller.js';
import { authenticate } from '../../shared/middleware/Auth.middleware.js';
import { validate } from '../../shared/middleware/Validate.middleware.js';
import { loginSchema, changePasswordSchema } from './auth.validator.js';

const router = Router();

// Public routes
router.post('/login', validate(loginSchema), login);

// Protected routes
router.get('/me', authenticate, getProfile);
router.patch('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;
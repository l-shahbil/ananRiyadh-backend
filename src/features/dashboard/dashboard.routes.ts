// dashboard.routes.ts
import { Router } from 'express'
import { dashboardController } from './dashboard.controller.js'
import { authenticate, authorizeRoles } from '../../shared/middleware/Auth.middleware.js'
import {Role} from "@prisma/client"


const router = Router()

router.get('/stats', authenticate, authorizeRoles(Role.admin), dashboardController.getStats)

export default router
import { Router } from 'express'
import { locationsController } from './locations.controller.js'
import { authenticate, authorizeRoles } from '../../shared/middleware/Auth.middleware.js'
import { validate } from '../../shared/middleware/Validate.middleware.js'
import { createCitySchema, updateCitySchema, createDistrictSchema, updateDistrictSchema } from './locations.validator.js'
import {Role} from "@prisma/client"

const router = Router()

// ===== Cities =====
router.get('/cities', locationsController.getCities)
router.post('/cities', authenticate, authorizeRoles(Role.admin), validate(createCitySchema), locationsController.createCity)
router.put('/cities/:id', authenticate, authorizeRoles(Role.admin), validate(updateCitySchema), locationsController.updateCity)
router.delete('/cities/:id', authenticate, authorizeRoles(Role.admin), locationsController.deleteCity)

// ===== Districts =====
router.get('/cities/:cityId/districts', locationsController.getDistrictsByCity)
router.post('/districts', authenticate, authorizeRoles(Role.admin), validate(createDistrictSchema), locationsController.createDistrict)
router.put('/districts/:id', authenticate, authorizeRoles(Role.admin), validate(updateDistrictSchema), locationsController.updateDistrict)
router.delete('/districts/:id', authenticate, authorizeRoles(Role.admin), locationsController.deleteDistrict)

export default router
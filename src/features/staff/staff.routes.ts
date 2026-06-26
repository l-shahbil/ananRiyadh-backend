import Router from "express"
import {staffController} from "./staff.controller.js"
import {authenticate,authorizeRoles} from "../../shared/middleware/Auth.middleware.js"
import {validate} from "../../shared/middleware/Validate.middleware.js"
import {createStaffSchema,updateStaffSchema} from "./staff.validator.js"
import {Role} from "@prisma/client"

const router =Router();


// protected routes
router.use(authenticate)

router.patch('/:id',authorizeRoles(Role.admin, Role.staff), validate(updateStaffSchema), staffController.updateStaff);
router.use(authorizeRoles(Role.admin))
router.get('/',          staffController.getStaffList);
router.get('/:id',       staffController.getStaffById);
router.post('/',         validate(createStaffSchema), staffController.createStaff);
router.patch('/:id/suspend',    staffController.suspendStaff);
router.patch('/:id/reactivate', staffController.reactivateStaff);
router.delete('/:id',    staffController.deleteStaff);

export default router;
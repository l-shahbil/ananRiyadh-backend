import {Router} from "express"
import {requestController} from "./request.controller.js"
import {authenticate,authorizeRoles} from "../../shared/middleware/Auth.middleware.js"
import {validate} from "../../shared/middleware/Validate.middleware.js"
import {createRequestSchema} from "./requests.validator.js"
import {Role} from "@prisma/client"

const router = Router()

// Public Routes
router.post("/",validate(createRequestSchema),requestController.createRequest)


// Protected Routes
router.use(authenticate,authorizeRoles(Role.staff,Role.admin))

router.get("/",requestController.getRequests)
router.patch('/:id/done',requestController.markAsDone)

export default router;

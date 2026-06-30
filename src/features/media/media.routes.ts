import { Router } from 'express';
import { mediaController } from './media.controller.js';
import { authenticate, authorizeRoles } from '../../shared/middleware/Auth.middleware.js';
import { uploadMiddleware } from '../../shared/middleware/Upload.middleware.js';
import { checkListingOwnership } from '../../shared/middleware/CheckListingOwnership.middleware.js';
import {Role} from "@prisma/client"


const router = Router();

// All media routes require authentication — staff + admin only
router.use(authenticate, authorizeRoles(Role.staff, Role.admin));

// ── Image Routes ──────────────────────────────────────────────────────────────

router.post('/:listingId/images',              uploadMiddleware, checkListingOwnership, mediaController.uploadImages);
router.delete('/:listingId/images/:imageId',   checkListingOwnership, mediaController.deleteImage);
router.patch('/:listingId/images/reorder',     checkListingOwnership, mediaController.reorderImages);
export default router;
import { Router } from 'express';
import { listingsController } from './listings.controller.js';
import { mediaController } from '../media/media.controller.js';
import { authenticate, authorizeRoles, optionalAuthenticate } from '../../shared/middleware/Auth.middleware.js';
import { validate } from '../../shared/middleware/Validate.middleware.js';
import {
  validateCreateListing,
  validateUpdateListing,
  validateChangeStatus,
  validateListingId,
} from './listings.validator.js';

const router = Router();

// ── My listings (staff + admin) — MUST be registered before '/:slug' ─────────
router.get('/my',       authenticate, authorizeRoles('staff', 'admin'), listingsController.getMyListings);
router.get('/my/stats', authenticate, authorizeRoles('staff', 'admin'), listingsController.getMyStats);

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/',              listingsController.getListings);
router.get('/:slug',         optionalAuthenticate, listingsController.getListingBySlug);
router.get('/:slug/similar', listingsController.getSimilarListings);

// ── Protected routes — staff + admin ─────────────────────────────────────────
router.use(authenticate, authorizeRoles('staff', 'admin'));

router.post('/',            validate(validateCreateListing), listingsController.createListing);
router.put('/:id',          validate(validateUpdateListing), listingsController.updateListing);
router.patch('/:id/status', validate(validateChangeStatus),  listingsController.changeStatus);
router.delete('/:id',       validate(validateListingId),     listingsController.deleteListing);

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.patch('/:id/featured', authorizeRoles('admin'), validate(validateListingId), listingsController.toggleFeatured);

export default router;
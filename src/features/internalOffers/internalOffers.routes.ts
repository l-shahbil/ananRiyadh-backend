import { Router } from 'express';
import { authenticate, authorizeRoles } from '../../shared/middleware/Auth.middleware.js';
import { validate } from '../../shared/middleware/Validate.middleware.js';
import { uploadSingleMiddleware } from '../../shared/middleware/Upload.middleware.js';
import { createOfferSchema, updateOfferSchema } from './internalOffers.validator.js';
import { internalOffersController } from './internalOffers.controller.js';

const router = Router();

router.use(authenticate, authorizeRoles('admin', 'staff'));

router.get('/',     internalOffersController.getAll);
router.post('/',    uploadSingleMiddleware, validate(createOfferSchema), internalOffersController.create);
router.patch('/:id', uploadSingleMiddleware, validate(updateOfferSchema), internalOffersController.update);
router.delete('/:id', internalOffersController.delete);

export default router;
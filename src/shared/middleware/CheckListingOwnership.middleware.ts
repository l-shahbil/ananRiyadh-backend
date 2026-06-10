import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/error.js';

export async function checkListingOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Admin bypasses ownership check
    if (req.user?.role === 'admin') return next();

    const listingId = String(req.params.listingId ?? req.params.id);

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { ownerId: true },
    });

    if (!listing) throw new AppError('الإعلان غير موجود', 404);

    if (listing.ownerId !== req.user?.id) {
      throw new AppError('ليس لديك صلاحية للوصول لهذا الإعلان', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
}
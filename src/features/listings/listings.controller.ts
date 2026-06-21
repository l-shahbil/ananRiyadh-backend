import type { Request, Response, NextFunction } from 'express';
import { listingsService } from './listings.service.js';
import { successResponse } from '../../shared/utils/response.js';
import { ListingStatus } from '@prisma/client';

export const listingsController = {

  // ── Read Operations (Day 5) ──────────────────────────────────────────────────

  async getListings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await listingsService.getListings({
        ...req.query,
        page:     req.query.page     ? Number(req.query.page)     : 1,
        limit:    req.query.limit    ? Number(req.query.limit)    : 12,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      } as any);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async getListingBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await listingsService.getListingBySlug(String(req.params.slug));
      res.json(successResponse(listing));
    } catch (error) {
      next(error);
    }
  },

  async getSimilarListings(req: Request, res: Response, next: NextFunction) {
    try {
      const listings = await listingsService.getSimilarListings(String(req.params.slug));
      res.json(successResponse(listings));
    } catch (error) {
      next(error);
    }
  },
async getMyListings(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listingsService.getMyListings(
      req.user!.id,
      req.user!.isAdmin,
      req.query.ownerId ? String(req.query.ownerId) : undefined,
      {
        category: req.query.category as any,
        type:     req.query.type as any,
        purpose:  req.query.purpose as any,
        status:   req.query.status as any,
        city:     req.query.city ? String(req.query.city) : undefined,
        district: req.query.district ? String(req.query.district) : undefined,
        page:     req.query.page  ? Number(req.query.page)  : 1,
        limit:    req.query.limit ? Number(req.query.limit) : 10,
      }
    );
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
},

async getMyStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listingsService.getMyStats(
      req.user!.id,
      req.user!.isAdmin,
      req.query.ownerId ? String(req.query.ownerId) : undefined
    );
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
},
  // ── Write Operations (Day 6) ─────────────────────────────────────────────────

  async createListing(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await listingsService.createListing(req.user!.id, req.body);
      res.status(201).json(successResponse(listing));
    } catch (error) {
      next(error);
    }
  },

  async updateListing(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await listingsService.updateListing(
        String(req.params.id),
        req.user!.id,
        req.user!.isAdmin,
        req.body
      );
      res.json(successResponse(listing));
    } catch (error) {
      next(error);
    }
  },

  async changeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await listingsService.changeStatus(
        String(req.params.id),
        req.user!.id,
        req.user!.isAdmin,
        req.body.status as ListingStatus
      );
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async deleteListing(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await listingsService.deleteListing(
        String(req.params.id),
        req.user!.id,
        req.user!.isAdmin
      );
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  // ── Admin-only Operations ────────────────────────────────────────────────────

  async toggleFeatured(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listingsService.toggleFeatured(String(req.params.id));
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
},
};
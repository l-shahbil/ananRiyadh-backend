import type { Request, Response, NextFunction } from 'express';
import { listingsService } from './listings.service.js';
import { successResponse } from '../../shared/utils/response.js';
import { ListingCategory, ListingPurpose, ListingStatus, ListingType } from '@prisma/client';
import type { GetListingsSortBy } from './listings.service.js';

export const listingsController = {

  // ── Read Operations ──────────────────────────────────────────────────────────

  async getListings(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query;

      const result = await listingsService.getListings({
        category:     q.category     as ListingCategory  | undefined,
        type:         q.type         as ListingType      | undefined,
        purpose:      q.purpose      as ListingPurpose   | undefined,
        cityId:       q.cityId       ? String(q.cityId)       : undefined,
        districtId:   q.districtId   ? String(q.districtId)   : undefined,
        sortBy:       q.sortBy       as GetListingsSortBy | undefined,
        minPrice:     q.minPrice     ? Number(q.minPrice)     : undefined,
        maxPrice:     q.maxPrice     ? Number(q.maxPrice)     : undefined,
        minArea:      q.minArea      ? Number(q.minArea)      : undefined,
        maxArea:      q.maxArea      ? Number(q.maxArea)      : undefined,
        minRooms:     q.minRooms     ? Number(q.minRooms)     : undefined,
        maxRooms:     q.maxRooms     ? Number(q.maxRooms)     : undefined,
        minBathrooms: q.minBathrooms ? Number(q.minBathrooms) : undefined,
        maxBathrooms: q.maxBathrooms ? Number(q.maxBathrooms) : undefined,
        page:         q.page         ? Number(q.page)         : 1,
        limit:        q.limit        ? Number(q.limit)        : 10,
      });

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async getListingBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await listingsService.getListingBySlug(
        String(req.params.slug),
        req.user?.role
      );
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
          category:   req.query.category   as ListingCategory | undefined,
          type:       req.query.type       as ListingType     | undefined,
          purpose:    req.query.purpose    as ListingPurpose  | undefined,
          status:     req.query.status     as ListingStatus   | undefined,
          cityId:     req.query.cityId     ? String(req.query.cityId)     : undefined,
          districtId: req.query.districtId ? String(req.query.districtId) : undefined,
          page:       req.query.page       ? Number(req.query.page)       : 1,
          limit:      req.query.limit      ? Number(req.query.limit)      : 10,
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

  // ── Write Operations ─────────────────────────────────────────────────────────

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
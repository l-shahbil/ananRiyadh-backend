  import { prisma } from '../../shared/config/prisma.js';
  import { AppError } from '../../shared/utils/error.js';
  import { generateSlug } from '../../shared/utils/slug.js';
  import { Facing, ListingCategory, ListingPurpose, ListingStatus, ListingType } from '@prisma/client';
  import type {createListingInput,updateListingInput} from './listings.validator.js'

  // ─── Types ────────────────────────────────────────────────────────────────────

  interface GetListingsParams {
    category?: ListingCategory;
    type?: ListingType;
    purpose?: ListingPurpose;
    city?: string;
    district?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }

 
interface GetMyListingsParams {
  category?: ListingCategory | undefined;
  type?: ListingType | undefined;
  purpose?: ListingPurpose | undefined;
  status?: ListingStatus | undefined;
  city?: string | undefined;
  district?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  // Verify listing exists and belongs to the requesting user (unless admin)
  async function resolveListingOrThrow(id: string, requesterId: string, isAdmin: boolean) {
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) throw new AppError('الإعلان غير موجود', 404);

    // BR-020: staff can only touch their own listings
    if (!isAdmin && listing.ownerId !== requesterId) {
      throw new AppError('ليس لديك صلاحية للوصول لهذا الإعلان', 403);
    }

    return listing;
  }

  // ─── Valid status transitions — BR state machine ──────────────────────────────
  const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    active:    ['hidden', 'completed'],
    hidden:    ['active'],
    completed: [],
    expired:   [],
  };



  // ─── Service ──────────────────────────────────────────────────────────────────

  export const listingsService = {

    // ── Read Operations (Day 5) ──────────────────────────────────────────────────

    async getListings(params: GetListingsParams) {
      const {
        category,
        type,
        purpose,
        city,
        district,
        minPrice,
        maxPrice,
        page = 1,
        limit = 12,
      } = params;

      const skip = (page - 1) * limit;

      // Build dynamic where clause based on provided filters
      const where = {
        status: ListingStatus.active,
        ...(category && { category }),
        ...(type && { type }),
        ...(purpose && { purpose }),
        ...(city && { city }),
        ...(district && { district }),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              price: {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
              },
            }
          : {}),
      };

      const [listings, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          skip,
          take: limit,
          // BR-007: featured listings first, then newest
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            slug: true,
            titleAr: true,
            titleEn: true,
            category: true,
            type: true,
            purpose: true,
            price: true,
            city: true,
            district: true,
            area: true,
            isFeatured: true,
            status: true,
            createdAt: true,
            // Return only the first image for listing cards
            images: {
              take: 1,
              orderBy: { sortOrder: 'asc' },
              select: { url: true },
            },
          },
        }),
        prisma.listing.count({ where }),
      ]);

      return {
        listings,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    },

    async getListingBySlug(slug: string) {
      const listing = await prisma.listing.findUnique({
        where: { slug },
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
            select: {id:true,url: true, sortOrder: true },
          },
          // BR-008: return owner contact info — frontend reveals it on button click
          owner: {
            select: {
              name: true,
              phone: true,
              whatsappNumber:true
            },
          },
        },
      });

      // BR-001: only active listings visible to public
      if (!listing || listing.status !== ListingStatus.active) {
        throw new AppError('الإعلان غير موجود', 404);
      }

      return listing;
    },

   async getSimilarListings(slug: string) {
  const listing = await prisma.listing.findUnique({
    where: { slug },
    select: { id: true, category: true, city: true, purpose: true, type: true },
  });

  if (!listing) throw new AppError('الإعلان غير موجود', 404);

  const baseSelect = {
    id: true,
    slug: true,
    titleAr: true,
    titleEn: true,
    category: true,
    type: true,
    purpose: true,
    price: true,
    city: true,
    district: true,
    area: true,
    images: {
      take: 1,
      orderBy: { sortOrder: 'asc' as const },
      select: { url: true },
    },
  };

  const orderBy = [{ isFeatured: 'desc' as const }, { createdAt: 'desc' as const }];
  const similar: typeof listing[] = [];

  const fetchMore = async (where: object) => {
    const existingIds = [listing.id, ...similar.map((l) => l.id)];
    const needed = 4 - similar.length;
    if (needed <= 0) return;

    const results = await prisma.listing.findMany({
      where: { ...where, NOT: { id: { in: existingIds } } },
      take: needed,
      orderBy,
      select: baseSelect,
    });

    similar.push(...results);
  };

  const base = { status: ListingStatus.active };

  // Degree 1 — same category + purpose + city + type
  await fetchMore({ ...base, category: listing.category, purpose: listing.purpose, city: listing.city, type: listing.type });

  // Degree 2 — same category + purpose + city
  await fetchMore({ ...base, category: listing.category, purpose: listing.purpose, city: listing.city });

  // Degree 3 — same category + purpose
  await fetchMore({ ...base, category: listing.category, purpose: listing.purpose });

  // Degree 4 — any active listings (fallback)
  await fetchMore({ ...base });

  return similar;
},

async getMyListings(
  requesterId: string,
  isAdmin: boolean,
  ownerIdQuery: string | undefined,
  params: GetMyListingsParams
) {
  // BR: only admin can override ownerId — staff is always forced to their own id
  const targetOwnerId = isAdmin && ownerIdQuery ? ownerIdQuery : requesterId;

  const {
    category,
    type,
    purpose,
    status,
    city,
    district,
    page = 1,
    limit = 10,
  } = params;

  const skip = (page - 1) * limit;

  // No default status filter — owner needs to see listings in all states
  const where = {
    ownerId: targetOwnerId,
    ...(category && { category }),
    ...(type && { type }),
    ...(purpose && { purpose }),
    ...(status && { status }),
    ...(city && { city }),
    ...(district && { district }),
  };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        titleAr: true,
        titleEn: true,
        category: true,
        type: true,
        purpose: true,
        price: true,
        city: true,
        district: true,
        area: true,
        isFeatured: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' },
          select: { url: true },
        },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    listings,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
},

async getMyStats(requesterId: string, isAdmin: boolean, ownerIdQuery: string | undefined) {
  const targetOwnerId = isAdmin && ownerIdQuery ? ownerIdQuery : requesterId;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [active, completed, expiringThisMonth] = await Promise.all([
    prisma.listing.count({
      where: { ownerId: targetOwnerId, status: ListingStatus.active },
    }),
    prisma.listing.count({
      where: { ownerId: targetOwnerId, status: ListingStatus.completed },
    }),
    prisma.listing.count({
      where: {
        ownerId: targetOwnerId,
        status: ListingStatus.active,
        expiresAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
  ]);

  return { active, completed, expiringThisMonth };
},
async createListing(ownerId: string, data: createListingInput) {
        const slug = await generateSlug(data.titleAr, data.city);

        const listing = await prisma.listing.create({
          data: {
            ...data,
            slug,
            ownerId,
            // New listings start as active by default
            status: ListingStatus.active,
          },
        });

        return listing;
      },

async updateListing(
  id: string,
  requesterId: string,
  isAdmin: boolean,
  data: updateListingInput
) {
  await resolveListingOrThrow(id, requesterId, isAdmin);

  let slug: string | undefined;

  if (data.titleAr) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { city: true },
    });

    slug = await generateSlug(
      data.titleAr,
      data.city ?? listing!.city
    );
  }

  return prisma.listing.update({
    where: { id },
    data: {
      ...(data.titleAr !== undefined && { titleAr: data.titleAr }),
      ...(data.titleEn !== undefined && { titleEn: data.titleEn }),

      ...(data.descriptionAr !== undefined && { descriptionAr: data.descriptionAr }),
      ...(data.descriptionEn !== undefined && { descriptionEn: data.descriptionEn }),

      ...(data.category !== undefined && { category: data.category }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.purpose !== undefined && { purpose: data.purpose }),

      ...(data.price !== undefined && { price: data.price }),
      ...(data.area !== undefined && { area: data.area }),

      ...(data.city !== undefined && { city: data.city }),
      ...(data.district !== undefined && { district: data.district }),

      ...(data.rooms !== undefined && { rooms: data.rooms }),
      ...(data.livingRooms !== undefined && { livingRooms: data.livingRooms }),
      ...(data.bathRooms !== undefined && { bathRooms: data.bathRooms }),

      ...(data.facing !== undefined && { facing: data.facing }),
      ...(data.streetWidth !== undefined && { streetWidth: data.streetWidth }),

      ...(data.facing2 !== undefined && { facing2: data.facing2 }),
      ...(data.streetWidth2 !== undefined && { streetWidth2: data.streetWidth2 }),

      ...(data.facing3 !== undefined && { facing3: data.facing3 }),
      ...(data.streetWidth3 !== undefined && { streetWidth3: data.streetWidth3 }),

      ...(data.floor !== undefined && { floor: data.floor }),
      ...(data.totalFloors !== undefined && { totalFloors: data.totalFloors }),

      ...(data.adNumber !== undefined && { adNumber: data.adNumber }),
      ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt }),

      ...(slug && { slug }),
    },
  });
},

    async changeStatus(id: string, requesterId: string, isAdmin: boolean, newStatus: ListingStatus) {
      const listing = await resolveListingOrThrow(id, requesterId, isAdmin);

      const allowed = ALLOWED_TRANSITIONS[listing.status] ?? [];

      if (!allowed.includes(newStatus)) {
        throw new AppError(
          `لا يمكن تغيير الحالة من "${listing.status}" إلى "${newStatus}"`,
          422
        );
      }

      const updated = await prisma.listing.update({
        where: { id },
        data: { status: newStatus },
        select: { id: true, status: true },
      });

      return updated;
    },

    async deleteListing(id: string, requesterId: string, isAdmin: boolean) {
      // resolveListingOrThrow handles 404 + ownership check
      await resolveListingOrThrow(id, requesterId, isAdmin);

      // Cascade on ListingImage is handled by Prisma schema (onDelete: Cascade)
      await prisma.listing.delete({ where: { id } });
    },

    // ── Admin-only Operations ────────────────────────────────────────────────────

  async toggleFeatured(id: string) {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new AppError('الإعلان غير موجود', 404);

    return prisma.listing.update({
      where: { id },
      data: { isFeatured: !listing.isFeatured },
      select: { id: true, isFeatured: true },
    });
  }
  };
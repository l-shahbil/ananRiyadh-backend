import { prisma } from '../../shared/config/prisma.js';
import { AppError } from '../../shared/utils/error.js';
import { generateSlug } from '../../shared/utils/slug.js';
import { Prisma, ListingCategory, ListingPurpose, ListingStatus, ListingType } from '@prisma/client';
import type { createListingInput, updateListingInput } from './listings.validator.js'

// ─── Types ────────────────────────────────────────────────────────────────────

export type GetListingsSortBy = 'featured' | 'newest' | 'oldest' | 'price_desc' | 'price_asc';

interface GetListingsParams {
  category?:     ListingCategory  | undefined;
  type?:         ListingType      | undefined;
  purpose?:      ListingPurpose   | undefined;
  cityId?:       string           | undefined;
  districtId?:   string           | undefined;
  minPrice?:     number           | undefined;
  maxPrice?:     number           | undefined;
  minArea?:      number           | undefined;
  maxArea?:      number           | undefined;
  minRooms?:     number           | undefined;
  maxRooms?:     number           | undefined;
  minBathrooms?: number           | undefined;
  maxBathrooms?: number           | undefined;
  sortBy?:       GetListingsSortBy | undefined;
  page?:         number           | undefined;
  limit?:        number           | undefined;
}

interface GetMyListingsParams {
  category?:   ListingCategory | undefined;
  type?:       ListingType | undefined;
  purpose?:    ListingPurpose | undefined;
  status?:     ListingStatus | undefined;
  cityId?:     string | undefined;
  districtId?: string | undefined;
  page?:       number | undefined;
  limit?:      number | undefined;
}

// ─── Shared Select ────────────────────────────────────────────────────────────

const listingCardSelect = {
  id:         true,
  slug:       true,
  titleAr:    true,
  titleEn:    true,
  category:   true,
  type:       true,
  purpose:    true,
  price:      true,
  area:       true,
  rooms:      true,
  livingRooms:true,
  bathRooms:  true,
  isFeatured: true,
  status:     true,
  city:       { select: { id: true, nameAr: true, nameEn: true } },
  district:   { select: { id: true, nameAr: true, nameEn: true } },
  images: {
    take:    1,
    orderBy: { sortOrder: 'asc' as const },
    select:  { url: true },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function resolveListingOrThrow(id: string, requesterId: string, isAdmin: boolean) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) throw new AppError('الإعلان غير موجود', 404);
  if (!isAdmin && listing.ownerId !== requesterId) {
    throw new AppError('ليس لديك صلاحية للوصول لهذا الإعلان', 403);
  }
  return listing;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  active:    ['hidden', 'completed'],
  hidden:    ['active', 'completed'],
  completed: ['active','hidden'],
  expired:   [],
};

const SORT_ORDER: Record<GetListingsSortBy, Prisma.ListingOrderByWithRelationInput[]> = {
  newest:     [{ createdAt: 'desc' }],
  oldest:     [{ createdAt: 'asc'  }],
  price_desc: [{ price: 'desc' }],
  price_asc:  [{ price: 'asc'  }],
  featured:   [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const listingsService = {

  // ── Read Operations ──────────────────────────────────────────────────────────

  async getListings(params: GetListingsParams) {
    const {
      category, type, purpose,
      cityId, districtId,
      minPrice, maxPrice,
      minArea, maxArea,
      minRooms, maxRooms,
      minBathrooms, maxBathrooms,
      sortBy = 'featured',
      page = 1, limit = 12,
    } = params;

    const skip = (page - 1) * limit;

    const where = {
      status: ListingStatus.active,
      ...(category   && { category }),
      ...(type       && { type }),
      ...(purpose    && { purpose }),
      ...(cityId     && { cityId }),
      ...(districtId && { districtId }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? { price: {
            ...(minPrice !== undefined && { gte: minPrice }),
            ...(maxPrice !== undefined && { lte: maxPrice }),
          }}
        : {}),
      ...(minArea !== undefined || maxArea !== undefined
        ? { area: {
            ...(minArea !== undefined && { gte: minArea }),
            ...(maxArea !== undefined && { lte: maxArea }),
          }}
        : {}),
      ...(minRooms !== undefined || maxRooms !== undefined
        ? { rooms: {
            ...(minRooms !== undefined && { gte: minRooms }),
            ...(maxRooms !== undefined && { lte: maxRooms }),
          }}
        : {}),
      ...(minBathrooms !== undefined || maxBathrooms !== undefined
        ? { bathRooms: {
            ...(minBathrooms !== undefined && { gte: minBathrooms }),
            ...(maxBathrooms !== undefined && { lte: maxBathrooms }),
          }}
        : {}),
    };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take:    limit,
        orderBy: SORT_ORDER[sortBy] ?? SORT_ORDER.featured,
        select:  listingCardSelect,
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      listings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getListingBySlug(slug: string, role?: string) {
    const listing = await prisma.listing.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
          select:  { id: true, url: true, sortOrder: true },
        },
        owner: {
          select: { name: true,nameEn:true, phone: true, whatsappNumber: true },
        },
        city:     { select: { id: true, nameAr: true, nameEn: true } },
        district: { select: { id: true, nameAr: true, nameEn: true } },
      },
    });

    const isStaff = role === 'admin' || role === 'staff';

    if (!listing || (!isStaff && listing.status !== ListingStatus.active)) {
      throw new AppError('الإعلان غير موجود', 404);
    }

    return listing;
  },

  async getSimilarListings(slug: string) {
    const listing = await prisma.listing.findUnique({
      where:  { slug },
      select: { id: true, category: true, cityId: true, purpose: true, type: true },
    });

    if (!listing) throw new AppError('الإعلان غير موجود', 404);

    const orderBy  = [{ isFeatured: 'desc' as const }, { createdAt: 'desc' as const }];
    const similar: any[] = [];

    const fetchMore = async (where: object) => {
      const existingIds = [listing.id, ...similar.map((l) => l.id)];
      const needed = 3 - similar.length;
      if (needed <= 0) return;
      const results = await prisma.listing.findMany({
        where:   { ...where, NOT: { id: { in: existingIds } } },
        take:    needed,
        orderBy,
        select:  listingCardSelect,
      });
      similar.push(...results);
    };

    const base = { status: ListingStatus.active };

    await fetchMore({ ...base, category: listing.category, purpose: listing.purpose, cityId: listing.cityId, type: listing.type });
    await fetchMore({ ...base, category: listing.category, purpose: listing.purpose, cityId: listing.cityId });
    await fetchMore({ ...base, category: listing.category, purpose: listing.purpose });
    await fetchMore({ ...base });

    return similar;
  },

  async getMyListings(
    requesterId: string,
    isAdmin: boolean,
    ownerIdQuery: string | undefined,
    params: GetMyListingsParams
  ) {
    const targetOwnerId = isAdmin && ownerIdQuery ? ownerIdQuery : requesterId;

    const {
      category, type, purpose, status,
      cityId, districtId,
      page = 1, limit = 10,
    } = params;

    const skip = (page - 1) * limit;

    const where = {
      ownerId: targetOwnerId,
      ...(category   && { category }),
      ...(type       && { type }),
      ...(purpose    && { purpose }),
      ...(status     && { status }),
      ...(cityId     && { cityId }),
      ...(districtId && { districtId }),
    };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take:    limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        select:  { ...listingCardSelect, expiresAt: true, createdAt: true },
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      listings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

async getMyStats(requesterId: string, isAdmin: boolean, ownerIdQuery: string | undefined) {
  const targetOwnerId = isAdmin && ownerIdQuery ? ownerIdQuery : requesterId;

  const now          = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [active, hidden, completed, expired, expiringThisMonth] = await Promise.all([
    prisma.listing.count({ where: { ownerId: targetOwnerId, status: ListingStatus.active } }),
    prisma.listing.count({ where: { ownerId: targetOwnerId, status: ListingStatus.hidden } }),
    prisma.listing.count({ where: { ownerId: targetOwnerId, status: ListingStatus.completed } }),
    prisma.listing.count({ where: { ownerId: targetOwnerId, status: ListingStatus.expired } }),
    prisma.listing.count({
      where: {
        ownerId:   targetOwnerId,
        status:    ListingStatus.active,
        expiresAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
  ]);

  return { active, hidden, completed, expired, expiringThisMonth };
},

  async createListing(ownerId: string, data: createListingInput) {
    const city = await prisma.city.findUnique({ where: { id: data.cityId } });
    if (!city) throw new AppError('المدينة غير موجودة', 404);

    const district = await prisma.district.findUnique({ where: { id: data.districtId } });
    if (!district) throw new AppError('الحي غير موجودة', 404);

    const slug = await generateSlug(data.titleAr, city.nameAr);

    const createData: Prisma.ListingUncheckedCreateInput = {
      slug,
      ownerId,
      status:     ListingStatus.active,
      titleAr:    data.titleAr,
      titleEn:    data.titleEn,
      category:   data.category,
      type:       data.type,
      purpose:    data.purpose,
      price:      data.price,
      area:       data.area,
      cityId:     data.cityId,
      districtId: data.districtId,
      ...(data.descriptionAr !== undefined && { descriptionAr: data.descriptionAr }),
      ...(data.descriptionEn !== undefined && { descriptionEn: data.descriptionEn }),
      ...(data.rooms         !== undefined && { rooms: data.rooms }),
      ...(data.livingRooms   !== undefined && { livingRooms: data.livingRooms }),
      ...(data.bathRooms     !== undefined && { bathRooms: data.bathRooms }),
      ...(data.facingType    !== undefined && { facingType: data.facingType }),
      ...(data.facing        !== undefined && { facing: data.facing }),
      ...(data.streetWidth   !== undefined && { streetWidth: data.streetWidth }),
      ...(data.facing2       !== undefined && { facing2: data.facing2 }),
      ...(data.streetWidth2  !== undefined && { streetWidth2: data.streetWidth2 }),
      ...(data.facing3       !== undefined && { facing3: data.facing3 }),
      ...(data.streetWidth3  !== undefined && { streetWidth3: data.streetWidth3 }),
      ...(data.floor         !== undefined && { floor: data.floor }),
      ...(data.totalFloors   !== undefined && { totalFloors: data.totalFloors }),
      ...(data.AdNumber      !== undefined && { AdNumber: data.AdNumber }),
      ...(data.expiresAt     !== undefined && { expiresAt: data.expiresAt }),
    };

    return prisma.listing.create({ data: createData });
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
      const current = await prisma.listing.findUnique({
        where:  { id },
        select: { cityId: true },
      });

      const targetCityId = data.cityId ?? current!.cityId;
      const city = await prisma.city.findUnique({ where: { id: targetCityId } });
      if (!city) throw new AppError('المدينة غير موجودة', 404);

      slug = await generateSlug(data.titleAr, city.nameAr);
    }

    // Clear extra facing fields when facingType is downgraded
    const facingTypeCleanup: Prisma.ListingUncheckedUpdateInput = {};
    if (data.facingType === 'single') {
      facingTypeCleanup.facing2      = null;
      facingTypeCleanup.streetWidth2 = null;
      facingTypeCleanup.facing3      = null;
      facingTypeCleanup.streetWidth3 = null;
    } else if (data.facingType === 'corner') {
      facingTypeCleanup.facing3      = null;
      facingTypeCleanup.streetWidth3 = null;
    }

    const updateData: Prisma.ListingUncheckedUpdateInput = {
      ...(data.titleAr       !== undefined && { titleAr: data.titleAr }),
      ...(data.titleEn       !== undefined && { titleEn: data.titleEn }),
      ...(data.descriptionAr !== undefined && { descriptionAr: data.descriptionAr }),
      ...(data.descriptionEn !== undefined && { descriptionEn: data.descriptionEn }),
      ...(data.category      !== undefined && { category: data.category }),
      ...(data.type          !== undefined && { type: data.type }),
      ...(data.purpose       !== undefined && { purpose: data.purpose }),
      ...(data.price         !== undefined && { price: data.price }),
      ...(data.area          !== undefined && { area: data.area }),
      ...(data.cityId        !== undefined && { cityId: data.cityId }),
      ...(data.districtId    !== undefined && { districtId: data.districtId }),
      ...(data.rooms         !== undefined && { rooms: data.rooms }),
      ...(data.livingRooms   !== undefined && { livingRooms: data.livingRooms }),
      ...(data.bathRooms     !== undefined && { bathRooms: data.bathRooms }),
      ...(data.facingType    !== undefined && { facingType: data.facingType }),
      ...(data.facing        !== undefined && { facing: data.facing }),
      ...(data.streetWidth   !== undefined && { streetWidth: data.streetWidth }),
      ...(data.facing2       !== undefined && { facing2: data.facing2 }),
      ...(data.streetWidth2  !== undefined && { streetWidth2: data.streetWidth2 }),
      ...(data.facing3       !== undefined && { facing3: data.facing3 }),
      ...(data.streetWidth3  !== undefined && { streetWidth3: data.streetWidth3 }),
      ...(data.floor         !== undefined && { floor: data.floor }),
      ...(data.totalFloors   !== undefined && { totalFloors: data.totalFloors }),
      ...(data.AdNumber      !== undefined && { AdNumber: data.AdNumber }),
      ...(data.expiresAt     !== undefined && { expiresAt: data.expiresAt }),
      ...facingTypeCleanup,
      ...(slug && { slug }),
    };

    return prisma.listing.update({ where: { id }, data: updateData });
  },

  async changeStatus(id: string, requesterId: string, isAdmin: boolean, newStatus: ListingStatus) {
    const listing = await resolveListingOrThrow(id, requesterId, isAdmin);

    const allowed = ALLOWED_TRANSITIONS[listing.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(`لا يمكن تغيير الحالة من "${listing.status}" إلى "${newStatus}"`, 422);
    }

    return prisma.listing.update({
      where:  { id },
      data:   { status: newStatus },
      select: { id: true, status: true },
    });
  },

  async deleteListing(id: string, requesterId: string, isAdmin: boolean) {
    await resolveListingOrThrow(id, requesterId, isAdmin);
    await prisma.listing.delete({ where: { id } });
  },

  async toggleFeatured(id: string) {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new AppError('الإعلان غير موجود', 404);

    return prisma.listing.update({
      where:  { id },
      data:   { isFeatured: !listing.isFeatured },
      select: { id: true, isFeatured: true },
    });
  },
};
import { z } from 'zod';
import { ListingCategory, ListingType, ListingPurpose, Facing, ListingStatus, FacingType } from '@prisma/client'

const facingField     = z.enum(Facing).optional().transform(v => v ?? null);
const facingTypeField = z.enum(FacingType).optional().transform(v => v ?? null);
const streetField     = z.number().min(0).optional().transform(v => v ?? null);
const intField        = z.number().int().min(0).optional().transform(v => v ?? null);

// ─── Create Listing ───────────────────────────────────────────────────────────

export const validateCreateListing = z.object({
  body: z.object({
    titleAr: z.string().trim().min(1, "العنوان بالعربي مطلوب").max(200, "العنوان طويل جداً"),
    titleEn: z.string({ error: "العنوان بالانجليزي مطلوب" }).trim().min(1, "العنوان بالانجليزي مطلوب").max(200, "العنوان الإنجليزي طويل جداً"),

    descriptionAr: z.string().trim().max(5000).optional().transform(v => v ?? null),
    descriptionEn: z.string().trim().max(5000).optional().transform(v => v ?? null),

    category: z.enum(ListingCategory, { error: "التصنيف مطلوب أو غير صحيح" }),
    type:     z.enum(ListingType,     { error: "النوع مطلوب أو غير صحيح" }),
    purpose:  z.enum(ListingPurpose,  { error: "الغرض مطلوب أو غير صحيح" }),

    price: z.number({ error: "السعر مطلوب ويجب أن يكون رقماً" }).min(0),
    area:  z.number({ error: "المساحة مطلوبة ويجب أن تكون رقماً" }).min(0),

    cityId:     z.string({ error: "المدينة مطلوبة" }).min(1, "المدينة مطلوبة"),
    districtId: z.string({ error: "الحي مطلوب" }).min(1, "الحي مطلوب"),

    rooms:       intField,
    livingRooms: intField,
    bathRooms:   intField,

    facingType:  facingTypeField,
    facing:      facingField,
    streetWidth: streetField,

    facing2:      facingField,
    streetWidth2: streetField,
    facing3:      facingField,
    streetWidth3: streetField,

    floor:       z.number().int().optional().transform(v => v ?? null),
    totalFloors: z.number().int().min(1).optional().transform(v => v ?? null),

    AdNumber:  z.number().int().optional().transform(v => v ?? null),
    expiresAt: z.coerce.date({ error: "تاريخ الانتهاء غير صحيح" }).optional().transform(v => v ?? null),
  }),
  params: z.object({}),
  query:  z.object({}),
});

// ─── Update Listing ───────────────────────────────────────────────────────────

export const validateUpdateListing = z.object({
  body: z.object({
    titleAr: z.string().trim().min(1).max(200).optional(),
    titleEn: z.string().trim().max(200).optional(),

    descriptionAr: z.string().trim().max(5000).nullable().optional(),
    descriptionEn: z.string().trim().max(5000).nullable().optional(),

    category: z.enum(ListingCategory).optional(),
    type:     z.enum(ListingType).optional(),
    purpose:  z.enum(ListingPurpose).optional(),

    price: z.number().min(0).optional(),
    area:  z.number().min(0).optional(),

    cityId:     z.string().min(1).optional(),
    districtId: z.string().min(1).optional(),

    rooms:       z.number().int().min(0).nullable().optional(),
    livingRooms: z.number().int().min(0).nullable().optional(),
    bathRooms:   z.number().int().min(0).nullable().optional(),

    facingType:  z.enum(FacingType).nullable().optional(),
    facing:      z.enum(Facing).nullable().optional(),
    streetWidth: z.number().min(0).nullable().optional(),

    facing2:      z.enum(Facing).nullable().optional(),
    streetWidth2: z.number().min(0).nullable().optional(),
    facing3:      z.enum(Facing).nullable().optional(),
    streetWidth3: z.number().min(0).nullable().optional(),

    floor:       z.number().int().nullable().optional(),
    totalFloors: z.number().int().min(1).nullable().optional(),

    AdNumber:  z.number().int().nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
  }),
  params: z.object({
    id: z.string().min(1, "معرف الإعلان مطلوب"),
  }),
  query: z.object({}),
});

// ─── Change Status ────────────────────────────────────────────────────────────

export const validateChangeStatus = z.object({
  body: z.object({
    status: z.enum(ListingStatus, { error: "الحالة غير صحيحة" }),
  }),
  params: z.object({
    id: z.string().min(1, "معرف الإعلان مطلوب"),
  }),
  query: z.object({}),
});

// ─── Listing ID Param ─────────────────────────────────────────────────────────

export const validateListingId = z.object({
  body:   z.object({}),
  params: z.object({
    id: z.string().min(1, "معرف الإعلان مطلوب"),
  }),
  query: z.object({}),
});

export type createListingInput = z.infer<typeof validateCreateListing>["body"]
export type updateListingInput = z.infer<typeof validateUpdateListing>["body"]
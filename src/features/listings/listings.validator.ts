import { z } from 'zod';

// ─── Reusable Enums ───────────────────────────────────────────────────────────

const CATEGORIES = ["residential", "commercial", "industrial", "land"] as const;

const TYPES = [
  "apartment", "floor", "building", "villa", "duplex",
  "palace", "townhouse", "studio", "room",
  "office", "showroom", "station", "warehouse", "shop", "workshop",
  "factory", "depot",
  "residential_land", "commercial_land", "industrial_land",
] as const;

const PURPOSES = ["sale", "rent"] as const;
const FACINGS  = ["north", "south", "east", "west", "corner", "three_side"] as const;
const STATUSES = ["active", "hidden", "completed"] as const;

// ─── Reusable Fields ──────────────────────────────────────────────────────────

const facingField    = z.enum(FACINGS).optional();
const streetField    = z.number().min(0).optional();
const intField       = z.number().int().min(0).optional();

// ─── Create Listing ───────────────────────────────────────────────────────────

export const validateCreateListing = z.object({
  body: z.object({
    titleAr: z.string().trim().min(1, "العنوان بالعربي مطلوب").max(200, "العنوان طويل جداً"),
    titleEn: z.string({error:"العنوان بالانجليزي مطلوب"}).trim().min(1, "العنوان بالانجليزي مطلوب").max(200, "العنوان الإنجليزي طويل جداً"),

    descriptionAr: z.string().trim().max(5000, "الوصف العربي طويل جداً").optional(),
    descriptionEn: z.string().trim().max(5000, "الوصف الإنجليزي طويل جداً").optional(),

    category: z.enum(CATEGORIES, { error: "التصنيف مطلوب أو غير صحيح" }),
    type:     z.enum(TYPES,       { error: "النوع مطلوب أو غير صحيح" }),
    purpose:  z.enum(PURPOSES,    { error: "الغرض مطلوب أو غير صحيح" }),

    price: z.number({ error: "السعر مطلوب ويجب أن يكون رقماً" }).min(0),
    area:  z.number({ error: "المساحة مطلوبة ويجب أن تكون رقماً" }).min(0),

    city: z.string({ error: "المدينة مطلوبة" }).trim().min(1, "المدينة مطلوبة").max(100, "اسم المدينة طويل جداً"),
    district: z.string().trim().max(100, "اسم الحي طويل جداً").optional(),

    rooms:       intField,
    livingRooms: intField,
    bathRooms:   intField,

    facing:      facingField,
    streetWidth: streetField,

    // Corner-only fields — business rule BR-009
    facing2:      facingField,
    streetWidth2: streetField,
    facing3:      facingField,
    streetWidth3: streetField,

    floor:       z.number().int().optional(),
    totalFloors: z.number().int().min(1, "عدد الأدوار يجب أن يكون أكبر من صفر").optional(),

    expiresAt: z.coerce.date({ error: "تاريخ الانتهاء غير صحيح" }).optional(),
  }),
  params: z.object({}),
  query:  z.object({}),
});

// ─── Update Listing ───────────────────────────────────────────────────────────

export const validateUpdateListing = z.object({
  body: z.object({
    titleAr: z.string().trim().min(1, "العنوان لا يمكن أن يكون فارغاً").max(200).optional(),
    titleEn: z.string().trim().max(200).optional(),

    descriptionAr: z.string().trim().max(5000).optional(),
    descriptionEn: z.string().trim().max(5000).optional(),

    category: z.enum(CATEGORIES).optional(),
    type:     z.enum(TYPES).optional(),
    purpose:  z.enum(PURPOSES).optional(),

    price: z.number().min(0).optional(),
    area:  z.number().min(0).optional(),

    city:     z.string().trim().min(1, "المدينة لا يمكن أن تكون فارغة").max(100).optional(),
    district: z.string().trim().max(100).nullable().optional(),

    rooms:       z.number().int().min(0).nullable().optional(),
    livingRooms: z.number().int().min(0).nullable().optional(),
    bathRooms:   z.number().int().min(0).nullable().optional(),

    facing:      z.enum(FACINGS).nullable().optional(),
    streetWidth: z.number().min(0).nullable().optional(),

    facing2:      z.enum(FACINGS).nullable().optional(),
    streetWidth2: z.number().min(0).nullable().optional(),
    facing3:      z.enum(FACINGS).nullable().optional(),
    streetWidth3: z.number().min(0).nullable().optional(),

    floor:       z.number().int().nullable().optional(),
    totalFloors: z.number().int().min(1).nullable().optional(),

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
    status: z.enum(STATUSES, { error: "الحالة غير صحيحة — المسموح: active, hidden, completed" }),
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
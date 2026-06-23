import z from "zod"
import { RequestType, Desire, FamilyType, ListingCategory, ListingType } from "@prisma/client"


export const createRequestSchema = z.object({
    body:z.object({
        type:z.nativeEnum(RequestType),
        name:z.string().nonempty("الاسم مطلوب"),
        phone:z.string().nonempty("رقم الجوال مطلوب"),
        message:z.string().optional(),
        desire:z.nativeEnum(Desire),
        propertyCategory:z.nativeEnum(ListingCategory),
        propertyType:z.nativeEnum(ListingType),
        city:z.string().nonempty("المدينة مطلوبة"),
        district:z.string().optional(),
        priceMin:z.coerce.number().positive().optional(),
        priceMax:z.coerce.number().positive().optional(),
        familyType:z.nativeEnum(FamilyType).optional(),
    })
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>["body"];


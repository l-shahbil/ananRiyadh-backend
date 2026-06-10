export { $Enums as Enums, PrismaClient } from '@prisma/client'
export type { 
  User, 
  Listing, 
  ListingImage, 
  Request, 
  InternalOffer, 
  Settings 
} from '@prisma/client'

// Re-export enums directly for backwards compatibility
import { $Enums } from '@prisma/client'
export const UserStatus = $Enums.UserStatus
export const Role = $Enums.Role
export const ListingStatus = $Enums.ListingStatus
export const ListingCategory = $Enums.ListingCategory
export const ListingType = $Enums.ListingType
export const ListingPurpose = $Enums.ListingPurpose
export const Facing = $Enums.Facing
export const RequestType = $Enums.RequestType
export const RequestStatus = $Enums.RequestStatus
export const Desire = $Enums.Desire
export const FamilyType = $Enums.FamilyType

export type UserStatus = $Enums.UserStatus
export type Role = $Enums.Role
export type ListingStatus = $Enums.ListingStatus
export type ListingCategory = $Enums.ListingCategory
export type ListingType = $Enums.ListingType
export type ListingPurpose = $Enums.ListingPurpose
export type Facing = $Enums.Facing
export type RequestType = $Enums.RequestType
export type RequestStatus = $Enums.RequestStatus
export type Desire = $Enums.Desire
export type FamilyType = $Enums.FamilyType
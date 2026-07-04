/*
  Warnings:

  - The values [duplex,palace,depot] on the enum `ListingType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ListingType_new" AS ENUM ('apartment', 'floor', 'villa', 'townhouse', 'studio', 'room', 'rest_house', 'building', 'office', 'showroom', 'shop', 'warehouse', 'station', 'factory', 'workshop', 'residential_land', 'commercial_land', 'industrial_land');
ALTER TABLE "Listing" ALTER COLUMN "type" TYPE "ListingType_new" USING ("type"::text::"ListingType_new");
ALTER TABLE "Request" ALTER COLUMN "propertyType" TYPE "ListingType_new" USING ("propertyType"::text::"ListingType_new");
ALTER TYPE "ListingType" RENAME TO "ListingType_old";
ALTER TYPE "ListingType_new" RENAME TO "ListingType";
DROP TYPE "public"."ListingType_old";
COMMIT;

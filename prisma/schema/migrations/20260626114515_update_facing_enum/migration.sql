/*
  Warnings:

  - The values [corner,three_sides] on the enum `Facing` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "FacingType" AS ENUM ('single', 'corner', 'three_sides');

-- AlterEnum
BEGIN;
CREATE TYPE "Facing_new" AS ENUM ('north', 'south', 'east', 'west');
ALTER TABLE "Listing" ALTER COLUMN "facing" TYPE "Facing_new" USING ("facing"::text::"Facing_new");
ALTER TABLE "Listing" ALTER COLUMN "facing2" TYPE "Facing_new" USING ("facing2"::text::"Facing_new");
ALTER TABLE "Listing" ALTER COLUMN "facing3" TYPE "Facing_new" USING ("facing3"::text::"Facing_new");
ALTER TYPE "Facing" RENAME TO "Facing_old";
ALTER TYPE "Facing_new" RENAME TO "Facing";
DROP TYPE "public"."Facing_old";
COMMIT;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "facingType" "FacingType";

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "X" TEXT NOT NULL DEFAULT '';

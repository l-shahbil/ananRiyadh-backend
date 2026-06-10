/*
  Warnings:

  - You are about to drop the column `whatsappOverride` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InternalOffer" ADD COLUMN     "cloudinaryImageId" TEXT;

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "whatsappOverride";

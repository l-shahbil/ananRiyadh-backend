/*
  Warnings:

  - You are about to drop the column `address` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "address",
DROP COLUMN "twitter",
ADD COLUMN     "addressAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "addressEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "snapshat" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tiktok" TEXT NOT NULL DEFAULT '';

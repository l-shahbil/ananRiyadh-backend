/*
  Warnings:

  - You are about to drop the column `key` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Settings` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Settings_key_idx";

-- DropIndex
DROP INDEX "Settings_key_key";

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "key",
DROP COLUMN "updatedAt",
DROP COLUMN "value",
ADD COLUMN     "address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "descriptionAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "descriptionEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "instagram" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nameAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nameEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "twitter" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whatsapp" TEXT NOT NULL DEFAULT '';

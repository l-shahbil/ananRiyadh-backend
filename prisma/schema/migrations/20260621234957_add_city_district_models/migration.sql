-- 1. إنشاء الجداول الجديدة
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "cityId" TEXT NOT NULL,
    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- 2. إضافة الأعمدة الجديدة كـ nullable مؤقتاً
ALTER TABLE "Listing" ADD COLUMN "cityId" TEXT;
ALTER TABLE "Listing" ADD COLUMN "districtId" TEXT;

-- 3. تعبئة المدن الفعلية من القيم القديمة
INSERT INTO "cities" ("id", "nameAr", "nameEn")
SELECT substr(md5(random()::text || clock_timestamp()::text), 1, 20), t."city", t."city"
FROM (SELECT DISTINCT "city" FROM "Listing" WHERE "city" IS NOT NULL) t;

-- 4. تعبئة الأحياء الفعلية
INSERT INTO "districts" ("id", "nameAr", "cityId")
SELECT substr(md5(random()::text || clock_timestamp()::text), 1, 20), t."district", c."id"
FROM (SELECT DISTINCT "city", "district" FROM "Listing" WHERE "district" IS NOT NULL AND "city" IS NOT NULL) t
JOIN "cities" c ON c."nameAr" = t."city";

-- 5. تحديث cityId و districtId لكل سجل
UPDATE "Listing" l
SET "cityId" = (SELECT c."id" FROM "cities" c WHERE c."nameAr" = l."city");

UPDATE "Listing" l
SET "districtId" = (SELECT d."id" FROM "districts" d WHERE d."nameAr" = l."district" AND d."cityId" = l."cityId");

-- 6. حذف الأعمدة القديمة وفرض NOT NULL
ALTER TABLE "Listing" DROP COLUMN "city";
ALTER TABLE "Listing" DROP COLUMN "district";
ALTER TABLE "Listing" ALTER COLUMN "cityId" SET NOT NULL;
ALTER TABLE "Listing" ALTER COLUMN "districtId" SET NOT NULL;

-- 7. الفهارس
CREATE INDEX "districts_cityId_idx" ON "districts"("cityId");
CREATE INDEX "Listing_cityId_districtId_idx" ON "Listing"("cityId", "districtId");
CREATE INDEX "Listing_status_cityId_category_purpose_idx" ON "Listing"("status", "cityId", "category", "purpose");

-- 8. المفاتيح الأجنبية
ALTER TABLE "districts" ADD CONSTRAINT "districts_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
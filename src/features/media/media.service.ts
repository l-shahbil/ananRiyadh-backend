import { prisma } from '../../shared/config/prisma.js';
import cloudinary from '../../shared/config/cloudinary.js';
import { AppError } from '../../shared/utils/error.js';
import {uploadRules} from "../../shared/config/uploadRules.js"
import {cloudinaryFolder} from "../../shared/config/cloudinary.js"

export const mediaService = {

  async uploadImages(listingId: string, files: Express.Multer.File[]) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, _count: { select: { images: true } } },
    });

    if (!listing) throw new AppError('الإعلان غير موجود', 404);

    // Check total will not exceed limit
    if (listing._count.images + files.length > uploadRules.MAX_FILES) {
      throw new AppError(
        `الحد الأقصى ${uploadRules.MAX_FILES} صورة — عندك ${listing._count.images} والمرسل ${files.length}`,
        422
      );
    }

    // Validate each file before uploading any
    for (const file of files) {
      if (!(uploadRules.ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
        throw new AppError('صيغة الملف غير مدعومة — المسموح: JPEG, PNG, WEBP', 422);
      }
      if (file.size > uploadRules.MAX_FILE_SIZE) {
        throw new AppError('حجم الصورة يتجاوز الحد المسموح (15MB)', 422);
      }
    }
    
    // Get starting sort order
    const lastImage = await prisma.listingImage.findFirst({
      where: { listingId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const startOrder = (lastImage?.sortOrder ?? -1) + 1;

    // Upload all files to Cloudinary
    const uploadPromises = files.map((file, index) =>
      new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `${cloudinaryFolder.folder}/${listingId}`,
            resource_type: 'image',
            transformation: [
              { quality: 'auto:good', fetch_format: 'auto' },
              { width: 2048, crop: 'limit' },
            ],
          },
          (error, result) => {
            if (error || !result) return reject(new AppError('فشل رفع الصورة', 500));
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        );
        stream.end(file.buffer);
      }).then((uploaded) =>
        prisma.listingImage.create({
          data: {
            listingId,
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            sortOrder: startOrder + index,
          },
        })
      )
    );
    return Promise.all(uploadPromises);
  },

  async deleteImage(imageId: string, listingId: string) {
    const image = await prisma.listingImage.findFirst({
      where: { id: imageId, listingId },
    });

    if (!image) throw new AppError('الصورة غير موجودة', 404);

    const result = await cloudinary.uploader.destroy(image.publicId);
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new AppError('فشل حذف الصورة من Cloudinary', 500);
    }

    await prisma.listingImage.delete({ where: { id: imageId } });

    return { id: imageId };
  },

  async reorderImages(listingId: string, orderedIds: string[]) {
    const images = await prisma.listingImage.findMany({
      where: { listingId },
      select: { id: true },
    });

    const existingIds = new Set(images.map((img) => img.id));

    if (orderedIds.length !== images.length) {
      throw new AppError('عدد الصور المرسلة لا يطابق عدد صور الإعلان', 422);
    }

    const allBelong = orderedIds.every((id) => existingIds.has(id));
    if (!allBelong) throw new AppError('بعض الصور لا تنتمي لهذا الإعلان', 422);

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.listingImage.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    return { listingId, reordered: orderedIds.length };
  },
};
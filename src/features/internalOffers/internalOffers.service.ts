import { prisma } from '../../shared/config/prisma.js';
import { AppError } from '../../shared/utils/error.js';
import { sendDirectMessage } from '../../shared/utils/telegram.js';
import type { CreateOfferInput, UpdateOfferInput } from './internalOffers.validator.js';
import { UserStatus } from '@prisma/client';
import cloudinary, { cloudinaryFolder } from '../../shared/config/cloudinary.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function uploadToCloudinary(file: Express.Multer.File): Promise<{ url: string; cloudinaryImageId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: cloudinaryFolder.offersFolder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' },
          { width: 1024, crop: 'limit' },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(new AppError('فشل رفع الصورة', 500));
        resolve({ url: result.secure_url, cloudinaryImageId: result.public_id });
      }
    );
    stream.end(file.buffer);
  });
}

async function resolveOfferOrThrow(offerId: string, userId: string) {
  const offer = await prisma.internalOffer.findUnique({ where: { id: offerId } });
  if (!offer) throw new AppError('العرض غير موجود', 404);
  if (offer.authorId !== userId) throw new AppError('ليس لديك صلاحية لتعديل هذا العرض', 403);
  return offer;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const internalOffersService = {

  async getAll() {
    return prisma.internalOffer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  },

  async create(
    authorId: string,
    authorName: string,
    data: CreateOfferInput,
    file?: Express.Multer.File
  ) {
    let imageUrl: string | undefined;
    let cloudinaryImageId: string | undefined;

    if (file) {
      const uploaded = await uploadToCloudinary(file);
      imageUrl = uploaded.url;
      cloudinaryImageId = uploaded.cloudinaryImageId;
    }

    const offer = await prisma.internalOffer.create({
      data: {
        authorId,
        content: data.content,
        imageUrl: imageUrl ?? null,
        cloudinaryImageId: cloudinaryImageId ?? null,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    // Notify all active staff with telegramChatId
    const users = await prisma.user.findMany({
      where: { status: UserStatus.active, telegramChatId: { not: null } },
      select: { telegramChatId: true },
    });

    const text = `🏢 <b>عرض داخلي جديد</b>\n───────────────\n👤 من: ${authorName}\n📝 ${data.content}`;

    await Promise.all(
      users.map((u) => sendDirectMessage(u.telegramChatId!, text))
    );

    return offer;
  },

  async update(
    offerId: string,
    userId: string,
    data: UpdateOfferInput,
    file?: Express.Multer.File
  ) {
    const offer = await resolveOfferOrThrow(offerId, userId);

    let imageUrl = offer.imageUrl;
    let cloudinaryImageId = offer.cloudinaryImageId;

    if (file) {
      // Delete old image from Cloudinary if exists
      if (offer.cloudinaryImageId) {
        await cloudinary.uploader.destroy(offer.cloudinaryImageId);
      }
      const uploaded = await uploadToCloudinary(file);
      imageUrl = uploaded.url;
      cloudinaryImageId = uploaded.cloudinaryImageId;
    }

    return prisma.internalOffer.update({
      where: { id: offerId },
      data: {
        ...(data.content !== undefined && { content: data.content }),
        ...(imageUrl !== undefined && { imageUrl, cloudinaryImageId }),
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  },

  async delete(offerId: string, userId: string, isAdmin: boolean) {
    const offer = await prisma.internalOffer.findUnique({ where: { id: offerId } });

    if (!offer) throw new AppError('العرض غير موجود', 404);

    // Admin can delete any offer — author can delete their own
    if (!isAdmin && offer.authorId !== userId) {
      throw new AppError('ليس لديك صلاحية لحذف هذا العرض', 403);
    }

    // Delete image from Cloudinary if exists
    if (offer.cloudinaryImageId) {
      await cloudinary.uploader.destroy(offer.cloudinaryImageId);
    }

    await prisma.internalOffer.delete({ where: { id: offerId } });
  },
};
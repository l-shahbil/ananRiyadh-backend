import cron from "node-cron";
import { prisma } from "../config/prisma.js";
import { sendDirectMessage } from "../utils/telegram.js";
import { ListingStatus } from "@prisma/client";

export function startCronJobs() {
  // Runs every day at midnight
  cron.schedule("0 0 * * *", async () => {
    const now = new Date();

    const expiredListings = await prisma.listing.findMany({
      where: {
        status: ListingStatus.active,
        expiresAt: { lte: now },
      },
      include: {
        owner: {
          select: { telegramChatId: true },
        },
      },
    });

    if (expiredListings.length === 0) return;

    await prisma.listing.updateMany({
      where: { id: { in: expiredListings.map((l) => l.id) } },
      data: { status: ListingStatus.expired },
    });

    for (const listing of expiredListings) {
      if (!listing.owner.telegramChatId) continue;

      const message = `انتهى إعلانك: <b>${listing.titleAr}</b>\nيرجى التواصل مع الإدارة لتجديده.`;
      await sendDirectMessage(listing.owner.telegramChatId, message);
    }
  });
}
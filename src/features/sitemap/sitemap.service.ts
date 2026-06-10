import { prisma } from "../../shared/config/prisma.js";
import { ListingStatus } from "@prisma/client";

export const sitemapService = {
  async generate(baseUrl: string): Promise<string> {
    const listings = await prisma.listing.findMany({
      where: { status:ListingStatus.active },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const listingUrls = listings
      .map(
        (listing) => `
  <url>
    <loc>${baseUrl}/عقارات/${listing.slug}</loc>
    <lastmod>${listing.updatedAt.toISOString().split("T")[0]}</lastmod>
    <priority>0.8</priority>
  </url>`
      )
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/من-نحن</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/خدماتنا</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/تواصل-معنا</loc>
    <priority>0.5</priority>
  </url>${listingUrls}
</urlset>`;
  },
};
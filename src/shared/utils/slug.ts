import { prisma } from '../config/prisma.js';

// Convert Arabic/English title to a URL-safe slug
function toSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    // Arabic characters — keep them as-is for Arabic URLs
    .replace(/\s+/g, '-')        // spaces → hyphens
    .replace(/[^\u0600-\u06FF\w-]/g, '') // remove anything not Arabic/alphanumeric/hyphen
    .replace(/-+/g, '-')         // collapse multiple hyphens
    .replace(/^-|-$/g, '');      // trim leading/trailing hyphens
}

// Generate a unique slug — appends city then numeric suffix if collision exists
export async function generateSlug(titleAr: string, city: string): Promise<string> {
  const base = `${toSlug(titleAr)}-${toSlug(city)}`;

  // Check if base slug is already taken
  const existing = await prisma.listing.findUnique({ where: { slug: base } });
  if (!existing) return base;

  // Find all slugs that start with this base to avoid N+1 loop queries
  const conflicting = await prisma.listing.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });

  const taken = new Set(conflicting.map((l) => l.slug));

  // Find the first available suffix
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) {
    suffix++;
  }

  return `${base}-${suffix}`;
}
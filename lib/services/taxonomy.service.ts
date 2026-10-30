import db from "@/lib/db/client";
import { ListingStatus } from "@prisma/client";

export class TaxonomyService {
  /**
   * Retrieves featured top-level categories for the homepage grid
   */
  static async getFeaturedCategories() {
    try {
      return await db.category.findMany({
        where: {
          featuredOnHome: true,
          parentId: null,
        },
        include: {
          children: {
            take: 4,
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      });
    } catch {
      return [];
    }
  }

  /**
   * Retrieves featured neighborhoods/localities in Pimple Saudagar
   */
  static async getFeaturedLocations() {
    try {
      return await db.location.findMany({
        where: { featured: true },
        orderBy: { sortOrder: "asc" },
        take: 8,
      });
    } catch {
      return [];
    }
  }

  /**
   * Resolves a nested category hierarchy by slug path
   * e.g. ['food-and-dining', 'family-restaurants']
   */
  static async getCategoryBySlugPath(slugs: string[]) {
    if (slugs.length === 0) return null;

    const targetSlug = slugs[slugs.length - 1];
    if (!targetSlug) return null;

    try {
      const category = await db.category.findUnique({
        where: { slug: targetSlug },
        include: {
          parent: true,
          children: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      return category;
    } catch {
      return null;
    }
  }

  /**
   * Resolves a nested location hierarchy by slug path
   * e.g. ['pimple-saudagar', 'kunal-icon-road']
   */
  static async getLocationBySlugPath(slugs: string[]) {
    if (slugs.length === 0) return null;

    const targetSlug = slugs[slugs.length - 1];
    if (!targetSlug) return null;

    try {
      const location = await db.location.findUnique({
        where: { slug: targetSlug },
        include: {
          parent: true,
          children: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      return location;
    } catch {
      return null;
    }
  }

  /**
   * Fetches published listings within a category (including subcategories)
   * Sorted by plan priority DESC, averageRating DESC, publishedAt DESC
   */
  static async getListingsByCategory(categoryId: string, limit = 20) {
    try {
      // Get target category and all its children IDs
      const category = await db.category.findUnique({
        where: { id: categoryId },
        include: { children: { select: { id: true } } },
      });

      if (!category) return [];

      const categoryIds = [category.id, ...category.children.map((c) => c.id)];

      return await db.listing.findMany({
        where: {
          status: ListingStatus.published,
          categories: {
            some: {
              categoryId: { in: categoryIds },
            },
          },
        },
        include: {
          plan: true,
          media: {
            where: { scanStatus: "clean" },
            take: 1,
          },
          categories: {
            include: { category: true },
            take: 1,
          },
        },
        orderBy: [
          { priority: "desc" },
          { averageRating: "desc" },
          { publishedAt: "desc" },
        ],
        take: limit,
      });
    } catch {
      return [];
    }
  }

  /**
   * Fetches published listings within a specific locality/landmark
   */
  static async getListingsByLocation(locationId: string, limit = 20) {
    try {
      const location = await db.location.findUnique({
        where: { id: locationId },
        include: { children: { select: { id: true } } },
      });

      if (!location) return [];

      const locationIds = [location.id, ...location.children.map((l) => l.id)];

      return await db.listing.findMany({
        where: {
          status: ListingStatus.published,
          locations: {
            some: {
              locationId: { in: locationIds },
            },
          },
        },
        include: {
          plan: true,
          media: {
            where: { scanStatus: "clean" },
            take: 1,
          },
          categories: {
            include: { category: true },
            take: 1,
          },
        },
        orderBy: [
          { priority: "desc" },
          { averageRating: "desc" },
          { publishedAt: "desc" },
        ],
        take: limit,
      });
    } catch {
      return [];
    }
  }
}

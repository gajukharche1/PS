import { MetadataRoute } from "next";
import db from "@/lib/db/client";
import { env } from "@/lib/config/env";
import { ListingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "https://pimplesaudagar.org";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  let dynamicListingRoutes: MetadataRoute.Sitemap = [];
  let dynamicCategoryRoutes: MetadataRoute.Sitemap = [];
  let dynamicLocationRoutes: MetadataRoute.Sitemap = [];

  try {
    const listings = await db.listing.findMany({
      where: { status: ListingStatus.published },
      select: { slug: true, updatedAt: true },
      take: 5000,
    });

    dynamicListingRoutes = listings.map((item) => ({
      url: `${baseUrl}/listing/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    const categories = await db.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    dynamicCategoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const locations = await db.location.findMany({
      select: { slug: true, updatedAt: true },
    });

    dynamicLocationRoutes = locations.map((loc) => ({
      url: `${baseUrl}/location/${loc.slug}`,
      lastModified: loc.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.warn("Database unavailable during sitemap generation; serving static routes only.", error);
  }

  return [
    ...staticRoutes,
    ...dynamicListingRoutes,
    ...dynamicCategoryRoutes,
    ...dynamicLocationRoutes,
  ];
}

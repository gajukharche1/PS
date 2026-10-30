import db from "@/lib/db/client";

export class PlanService {
  /**
   * Retrieves all active pricing plans ordered by display order
   */
  static async getActivePlans() {
    try {
      return await db.pricingPlan.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      });
    } catch {
      return [
        {
          id: "plan_free_fallback",
          name: "Free Directory",
          slug: "free",
          priceMinor: 0,
          currency: "INR",
          billingPeriodDays: 365,
          maxPhotos: 4,
          maxCategories: 1,
          maxLocations: 1,
          featuredAllowed: false,
          badgeVisible: false,
          callButtonAllowed: true,
          whatsappAllowed: true,
          searchPriority: 1,
          displayOrder: 1,
          isActive: true,
          description: "Essential local presence for independent neighborhood businesses.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "plan_standard_fallback",
          name: "Standard Growth",
          slug: "standard",
          priceMinor: 499900,
          currency: "INR",
          billingPeriodDays: 365,
          maxPhotos: 12,
          maxCategories: 3,
          maxLocations: 2,
          featuredAllowed: false,
          badgeVisible: true,
          callButtonAllowed: true,
          whatsappAllowed: true,
          searchPriority: 5,
          displayOrder: 2,
          isActive: true,
          description: "Enhanced visibility, verified business badge, and multi-category coverage.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "plan_premium_fallback",
          name: "Premium Spotlight",
          slug: "premium",
          priceMinor: 999900,
          currency: "INR",
          billingPeriodDays: 365,
          maxPhotos: 30,
          maxCategories: 6,
          maxLocations: 4,
          featuredAllowed: true,
          badgeVisible: true,
          callButtonAllowed: true,
          whatsappAllowed: true,
          searchPriority: 10,
          displayOrder: 3,
          isActive: true,
          description: "Maximum prominence, top search placement, homepage feature, and dedicated lead capture.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }
  }

  /**
   * Resolves a plan by slug
   */
  static async getBySlug(slug: string) {
    try {
      return await db.pricingPlan.findUnique({
        where: { slug },
      });
    } catch {
      return null;
    }
  }

  /**
   * Formats paise (minor currency) into readable INR representation
   */
  static formatPriceINR(priceMinor: number): string {
    if (priceMinor === 0) return "Free Forever";

    const rupees = priceMinor / 100;
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(rupees);

    return `${formatted} / year`;
  }
}

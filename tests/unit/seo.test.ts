import { describe, it, expect } from "vitest";
import { SeoService } from "@/lib/services/seo.service";

describe("SEO Service & JSON-LD Generators", () => {
  const mockListing = {
    id: "list_test_1",
    slug: "shivar-pure-veg",
    title: "Shivar Pure Veg & Garden Restaurant",
    description: "<p>Family vegetarian dining near Shivar Chowk.</p>",
    address: "Survey 45, Kunal Icon Road",
    locality: "Pimple Saudagar",
    phone: "9822001122",
    website: "https://shivarrestaurant.in",
    latitude: 18.5987,
    longitude: 73.7912,
    priceRange: 2,
    averageRating: 4.8,
    reviewCount: 42,
    categories: [{ category: { slug: "restaurants-cafes", name: "Restaurants & Cafes" } }],
    openingHours: {
      monday: { open: "11:00", close: "23:00", closed: false },
      sunday: { open: "11:00", close: "23:30", closed: false },
    },
  };

  it("generates valid LocalBusiness schema with category specialization", () => {
    const schema = SeoService.generateLocalBusinessSchema(mockListing, "https://pimplesaudagar.org");

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Restaurant");
    expect(schema.name).toBe("Shivar Pure Veg & Garden Restaurant");
    expect(schema.telephone).toBe("9822001122");
    expect(schema.priceRange).toBe("₹₹");
    expect(schema.address.addressLocality).toBe("Pimple Saudagar");
    expect(schema.address.postalCode).toBe("411027");
    expect(schema.geo.latitude).toBe(18.5987);
    expect(schema.aggregateRating.ratingValue).toBe("4.8");
    expect(schema.aggregateRating.reviewCount).toBe(42);
    expect(schema.openingHoursSpecification.length).toBeGreaterThan(0);
  });

  it("generates valid BreadcrumbList schema", () => {
    const breadcrumbs = [
      { name: "Home", url: "/" },
      { name: "Restaurants", url: "/category/restaurants-cafes" },
      { name: "Shivar Pure Veg", url: "/listing/shivar-pure-veg" },
    ];

    const schema = SeoService.generateBreadcrumbSchema(breadcrumbs, "https://pimplesaudagar.org");

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0]!.position).toBe(1);
    expect(schema.itemListElement[0]!.item).toBe("https://pimplesaudagar.org/");
    expect(schema.itemListElement[2]!.name).toBe("Shivar Pure Veg");
  });
});

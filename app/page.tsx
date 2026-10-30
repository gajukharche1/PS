import Link from "next/link";
import { Search, MapPin, Building2, Star, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { TaxonomyService } from "@/lib/services/taxonomy.service";
import { CategoryCard } from "@/components/taxonomy/category-card";
import { ListingCard } from "@/components/listing/listing-card";
import db from "@/lib/db/client";
import { ListingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, locations, featuredListings] = await Promise.all([
    TaxonomyService.getFeaturedCategories(),
    TaxonomyService.getFeaturedLocations(),
    db.listing
      .findMany({
        where: {
          status: ListingStatus.published,
          featured: true,
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
        orderBy: [{ priority: "desc" }, { averageRating: "desc" }],
        take: 6,
      })
      .catch(() => []),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-sm">
              PS
            </div>
            <div>
              <span className="font-bold tracking-tight text-lg text-foreground block leading-none">
                Pimple Saudagar
              </span>
              <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">
                Local Business Directory
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/search" className="transition-colors hover:text-foreground">
              Explore All
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              Pricing Plans
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              + List Business
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 to-background py-20 md:py-28">
          <div className="container relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur mb-6">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Verified Local Business Directory for Pimple Saudagar, PCMC</span>
            </div>

            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
              Find Trusted Services & Businesses in{" "}
              <span className="text-primary-600">Pimple Saudagar</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Explore top-rated clinics, restaurants, salons, home maintenance, and retail stores
              across Kunal Icon Road, Kokane Chowk, Govind Garden, and Shivar Chowk.
            </p>

            {/* Search Box Preview */}
            <div className="mt-8 w-full max-w-3xl rounded-xl border bg-card p-2 shadow-lg sm:p-3">
              <form action="/search" method="GET" className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search doctor, plumber, restaurant, salon..."
                    className="w-full rounded-lg bg-background py-3 pl-11 pr-4 text-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="relative sm:w-56">
                  <MapPin className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    name="location"
                    defaultValue="Pimple Saudagar"
                    placeholder="Locality / Landmark"
                    className="w-full rounded-lg bg-background py-3 pl-11 pr-4 text-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary-600"
                >
                  <span>Search</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Popular quick tags */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold">Popular Searches:</span>
              {["Restaurants", "Dentists", "Gyms", "Car Repair", "Play Schools", "Grocery"].map(
                (item) => (
                  <Link
                    key={item}
                    href={`/search?q=${encodeURIComponent(item)}`}
                    className="rounded-full border bg-background px-3 py-1 hover:border-primary hover:text-foreground transition-colors"
                  >
                    {item}
                  </Link>
                )
              )}
            </div>
          </div>
        </section>

        {/* Featured Categories Grid */}
        <section className="container py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Browse by Category
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Explore essential neighborhood services and shops
              </p>
            </div>
            <Link
              href="/search"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All Categories</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Featured Listings Carousel / Grid */}
        {featuredListings.length > 0 && (
          <section className="container py-12 border-t">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>PREMIUM SPOTLIGHT</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Featured Businesses
                </h2>
              </div>
              <Link
                href="/search?featured=true"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Explore Featured</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Locations in Pimple Saudagar */}
        <section className="container py-12 border-t">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Neighborhood Hubs & Localities
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Find commercial complexes, markets, and shops near prominent junctions in Pimple Saudagar
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {locations.map((loc) => (
              <Link
                key={loc.id}
                href={`/location/${loc.slug}`}
                className="group rounded-xl border bg-card p-3.5 shadow-card hover:border-primary transition flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                    {loc.name}
                  </h4>
                  <span className="text-[10px] text-muted-foreground">
                    {loc.listingCount} {loc.listingCount === 1 ? "Listing" : "Listings"}
                  </span>
                </div>
                <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="container py-16 border-t bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl border p-6 bg-card shadow-card">
              <div className="h-12 w-12 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">5,000+ Local Listings</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive coverage of independent stores, clinics, services, and commercial establishments in Pimple Saudagar.
              </p>
            </div>

            <div className="rounded-xl border p-6 bg-card shadow-card">
              <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Verified Neighborhood Reviews</h3>
              <p className="text-sm text-muted-foreground">
                Authentic, spam-filtered customer ratings and real photos submitted by verified neighborhood residents.
              </p>
            </div>

            <div className="rounded-xl border p-6 bg-card shadow-card">
              <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Direct Owner Contact</h3>
              <p className="text-sm text-muted-foreground">
                Call, WhatsApp, or send direct inquiries straight to business owners with zero middleman spam.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40 py-8 text-sm text-muted-foreground">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Pimple Saudagar Directory. Built for PCMC community.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy (DPDP Act)
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact & Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

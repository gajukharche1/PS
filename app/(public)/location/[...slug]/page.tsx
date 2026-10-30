import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TaxonomyService } from "@/lib/services/taxonomy.service";
import { ListingCard } from "@/components/listing/listing-card";
import { ChevronRight, MapPin } from "lucide-react";

interface LocationPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = await TaxonomyService.getLocationBySlugPath(slug);

  if (!location) {
    return { title: "Location Not Found | Pimple Saudagar Directory" };
  }

  return {
    title: `Businesses & Services in ${location.name}, Pimple Saudagar | Directory`,
    description:
      location.description ||
      `Explore top verified shops, doctors, dining, and professional services located at ${location.name}, Pimple Saudagar.`,
    alternates: {
      canonical: `/location/${slug.join("/")}`,
    },
  };
}

export default async function LocationArchivePage({ params }: LocationPageProps) {
  const { slug } = await params;
  const location = await TaxonomyService.getLocationBySlugPath(slug);

  if (!location) {
    notFound();
  }

  const listings = await TaxonomyService.getListingsByLocation(location.id);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
              PS
            </div>
            <span className="font-bold tracking-tight text-sm text-foreground">
              Pimple Saudagar Directory
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Search
            </Link>
            <Link
              href="/submit"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition"
            >
              + List Business
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-6xl flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/search" className="hover:text-foreground transition-colors">
            Locations
          </Link>
          {location.parent && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/location/${location.parent.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {location.parent.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{location.name}</span>
        </nav>

        {/* Location Header */}
        <div className="mb-8 border-b pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>Pimple Saudagar, PCMC</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {location.name} Local Businesses
          </h1>
          {location.description && (
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              {location.description}
            </p>
          )}

          {/* Sub-locations / Landmarks */}
          {location.children && location.children.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-muted-foreground">Nearby Landmarks:</span>
              {location.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/location/${location.slug}/${child.slug}`}
                  className="rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition shadow-xs"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Listings Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">
              Businesses in {location.name} ({listings.length})
            </h2>
            <span className="text-xs text-muted-foreground">Sorted by Verified & Plan Priority</span>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center bg-card">
              <MapPin className="h-10 w-10 text-muted-foreground/60 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-foreground">No listings found in this area</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Do you operate a business in {location.name}? Add your listing to reach local customers.
              </p>
              <Link
                href="/submit"
                className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition"
              >
                List Your Business Here
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

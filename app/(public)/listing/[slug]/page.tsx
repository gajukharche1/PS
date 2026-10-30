import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ListingService } from "@/lib/services/listing.service";
import { SeoService } from "@/lib/services/seo.service";
import { env } from "@/lib/config/env";
import { ListingGallery } from "@/components/listing/listing-gallery";
import { OpeningHoursCard } from "@/components/listing/opening-hours-card";
import { ContactCard } from "@/components/listing/contact-card";
import { Star, MapPin, Sparkles, Check, ChevronRight } from "lucide-react";

interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await ListingService.getBySlug(slug);
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "https://pimplesaudagar.org";

  if (!listing) {
    return {
      title: "Business Not Found | Pimple Saudagar Directory",
    };
  }

  const title = `${listing.title} in ${listing.locality}, Pimple Saudagar | Reviews & Contact`;
  const description = `Contact details, opening hours, photos, ratings, and customer reviews for ${listing.title} located at ${listing.locality}, Pimple Saudagar.`;
  const url = `${baseUrl}/listing/${listing.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Pimple Saudagar Directory",
      locale: "en_IN",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await ListingService.getBySlug(slug);
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "https://pimplesaudagar.org";

  if (!listing) {
    notFound();
  }

  // Fire-and-forget view counter increment
  ListingService.trackView(listing.id);

  const primaryCategory = listing.categories[0]?.category;
  const primaryLocation = listing.locations.find((l) => l.isPrimary)?.location || listing.locations[0]?.location;
  const ratingNumber = Number(listing.averageRating);

  // Generate Structured Data (JSON-LD)
  const localBusinessSchema = SeoService.generateLocalBusinessSchema(listing, baseUrl);
  const breadcrumbSchema = SeoService.generateBreadcrumbSchema(
    [
      { name: "Home", url: "/" },
      ...(primaryCategory ? [{ name: primaryCategory.name, url: `/category/${primaryCategory.slug}` }] : []),
      { name: listing.title, url: `/listing/${listing.slug}` },
    ],
    baseUrl
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Navigation Header */}
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
              Explore Directory
            </Link>
            <Link
              href="/submit"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition"
            >
              + Add Business
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          {primaryCategory && (
            <>
              <Link href={`/category/${primaryCategory.slug}`} className="hover:text-foreground transition-colors">
                {primaryCategory.name}
              </Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-xs">{listing.title}</span>
        </nav>

        {/* Header Title & Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {listing.featured && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  <Sparkles className="h-3 w-3" />
                  <span>Featured Business</span>
                </span>
              )}
              {primaryCategory && (
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                  {primaryCategory.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {listing.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 font-semibold text-foreground">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{ratingNumber > 0 ? ratingNumber.toFixed(1) : "New"}</span>
                <span className="text-muted-foreground font-normal">
                  ({listing.reviewCount} {listing.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>

              <span>•</span>

              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{listing.locality}, Pimple Saudagar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-8">
          <ListingGallery media={listing.media} title={listing.title} />
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About / Sanitized Description */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h2 className="text-lg font-bold tracking-tight text-foreground mb-4">
                About {listing.title}
              </h2>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-3"
                dangerouslySetInnerHTML={{ __html: listing.description }}
              />
            </div>

            {/* Amenities & Features */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="rounded-xl border bg-card p-6 shadow-card">
                <h2 className="text-lg font-bold tracking-tight text-foreground mb-4">
                  Amenities & Facilities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 text-xs font-medium text-foreground bg-muted/50 p-2.5 rounded-lg border border-border/40"
                    >
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section Preview */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Customer Reviews ({listing.reviewCount})
                </h2>
                <Link
                  href={`/reviews/new?listing=${listing.slug}`}
                  className="rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary/20 transition"
                >
                  Write a Review
                </Link>
              </div>

              {listing.reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  <p>No verified reviews submitted yet. Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {listing.reviews.map((rev) => (
                    <div key={rev.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-foreground">{rev.reviewerName}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <h4 className="font-semibold text-xs text-foreground mb-1">{rev.title}</h4>
                      <p className="text-xs text-muted-foreground">{rev.body}</p>
                      {rev.ownerReply && (
                        <div className="mt-2.5 rounded-lg bg-muted p-2.5 text-xs border-l-2 border-primary">
                          <p className="font-semibold text-foreground text-[11px] mb-0.5">Response from Owner:</p>
                          <p className="text-muted-foreground">{rev.ownerReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            <ContactCard
              listingId={listing.id}
              slug={listing.slug}
              phone={listing.phone}
              whatsapp={listing.whatsapp}
              email={listing.email}
              website={listing.website}
              address={listing.address}
              locality={listing.locality}
              landmark={listing.landmark}
              claimStatus={listing.claimStatus}
              callAllowed={listing.plan?.callButtonAllowed ?? true}
              whatsappAllowed={listing.plan?.whatsappAllowed ?? true}
            />

            <OpeningHoursCard openingHours={listing.openingHours} />
          </div>
        </div>
      </main>
    </div>
  );
}

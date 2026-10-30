import { Metadata } from "next";
import Link from "next/link";
import { SearchService } from "@/lib/services/search.service";
import { TaxonomyService } from "@/lib/services/taxonomy.service";
import { ListingCard } from "@/components/listing/listing-card";
import { SearchFilters } from "@/components/search/search-filters";
import { MapView } from "@/components/map/map-view";
import { Search, Map, ListFilter, ArrowLeft } from "lucide-react";
import db from "@/lib/db/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Businesses & Services in Pimple Saudagar | Directory",
  description:
    "Search verified businesses, doctors, restaurants, clinics, and shops across Pimple Saudagar, PCMC.",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    location?: string;
    minRating?: string;
    priceRange?: string;
    sort?: "relevance" | "rating" | "newest" | "priority";
    view?: "list" | "map";
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "all";
  const location = params.location || "all";
  const minRating = params.minRating ? parseFloat(params.minRating) : 0;
  const sort = params.sort || "priority";
  const view = params.view || "list";
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [searchResult, allCategories, allLocations] = await Promise.all([
    SearchService.search({
      q,
      category,
      location,
      minRating,
      sort,
      page,
      limit: 12,
    }),
    db.category
      .findMany({
        select: { id: true, slug: true, name: true },
        orderBy: { sortOrder: "asc" },
      })
      .catch(() => []),
    db.location
      .findMany({
        select: { id: true, slug: true, name: true },
        orderBy: { sortOrder: "asc" },
      })
      .catch(() => []),
  ]);

  const { listings, total, totalPages, currentPage } = searchResult;

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
              href="/"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
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

      {/* Search Header Bar */}
      <section className="border-b bg-muted/20 py-6">
        <div className="container max-w-6xl">
          <form action="/search" method="GET" className="flex flex-col sm:flex-row gap-2 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search by business name, keyword, or service..."
                className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary-600 transition"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container py-8 max-w-6xl flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {q ? `Search results for "${q}"` : "Explore Businesses in Pimple Saudagar"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing {listings.length} of {total} verified local businesses
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 rounded-lg border bg-muted p-1 text-xs">
            <Link
              href={`/search?q=${encodeURIComponent(q)}&category=${category}&location=${location}&minRating=${minRating}&sort=${sort}&view=list`}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition ${
                view === "list"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>List</span>
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(q)}&category=${category}&location=${location}&minRating=${minRating}&sort=${sort}&view=map`}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition ${
                view === "map"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              <span>Map</span>
            </Link>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters
              currentCategory={category}
              currentLocation={location}
              currentSort={sort}
              currentMinRating={minRating}
              q={q}
              categories={allCategories}
              locations={allLocations}
            />
          </div>

          {/* Right Column: Search Results Grid or Map */}
          <div className="lg:col-span-3 space-y-6">
            {view === "map" ? (
              <MapView listings={listings} height="600px" />
            ) : listings.length === 0 ? (
              <div className="rounded-xl border border-dashed p-12 text-center bg-card">
                <Search className="h-10 w-10 text-muted-foreground/60 mx-auto mb-2" />
                <h3 className="font-bold text-sm text-foreground">No businesses match your criteria</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Try clearing some filters or searching with a different keyword.
                </p>
                <Link
                  href="/search"
                  className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition"
                >
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <Link
                      key={pageNum}
                      href={`/search?q=${encodeURIComponent(q)}&category=${category}&location=${location}&minRating=${minRating}&sort=${sort}&view=${view}&page=${pageNum}`}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold transition ${
                        isCurrent
                          ? "bg-primary text-primary-foreground shadow"
                          : "border bg-card text-foreground hover:border-primary"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

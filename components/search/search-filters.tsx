import { Filter, RotateCcw } from "lucide-react";
import Link from "next/link";

interface FilterProps {
  currentCategory?: string;
  currentLocation?: string;
  currentSort?: string;
  currentMinRating?: number;
  q?: string;
  categories: Array<{ id: string; slug: string; name: string }>;
  locations: Array<{ id: string; slug: string; name: string }>;
}

export function SearchFilters({
  currentCategory = "all",
  currentLocation = "all",
  currentSort = "priority",
  currentMinRating = 0,
  q = "",
  categories,
  locations,
}: FilterProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between pb-3 border-b mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm text-foreground">Filter Listings</h3>
        </div>

        <Link
          href="/search"
          className="text-[11px] font-semibold text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </Link>
      </div>

      <form action="/search" method="GET" className="space-y-4">
        {/* Preserve search keyword */}
        {q && <input type="hidden" name="q" value={q} />}

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Category
          </label>
          <select
            name="category"
            defaultValue={currentCategory}
            className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Locality Filter */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Locality / Landmark
          </label>
          <select
            name="location"
            defaultValue={currentLocation}
            className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Pimple Saudagar</option>
            {locations.map((l) => (
              <option key={l.id} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Minimum Rating
          </label>
          <select
            name="minRating"
            defaultValue={currentMinRating ? String(currentMinRating) : "0"}
            className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="0">Any Rating</option>
            <option value="4">4.0 Stars & above</option>
            <option value="4.5">4.5 Stars & above</option>
            <option value="3">3.0 Stars & above</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Sort Order
          </label>
          <select
            name="sort"
            defaultValue={currentSort}
            className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="priority">Featured & Priority</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newly Added</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary py-2.5 px-4 text-xs font-semibold text-primary-foreground shadow hover:bg-primary-600 transition"
        >
          Apply Filters
        </button>
      </form>
    </div>
  );
}

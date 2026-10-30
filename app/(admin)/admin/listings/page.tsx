import { Metadata } from "next";
import Link from "next/link";
import db from "@/lib/db/client";
import { ListingStatus } from "@prisma/client";
import { ListingStatusSelect } from "./listing-status-select";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Listing Management | Admin Back-Office",
  description: "Browse, filter, and moderate local business listings.",
};

interface SearchParamsProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
}

export default async function AdminListingsPage({ searchParams }: SearchParamsProps) {
  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status as ListingStatus | undefined;
  const query = resolvedParams.q || "";

  let listings: Array<{
    id: string;
    slug: string;
    title: string;
    status: ListingStatus;
    locality: string;
    address: string;
    phone: string | null;
    averageRating: any;
    reviewCount: number;
    createdAt: Date;
    categories: Array<{ category: { name: string } }>;
  }> = [];

  let totalCount = 0;

  try {
    const whereClause: any = {};
    if (statusFilter && Object.values(ListingStatus).includes(statusFilter)) {
      whereClause.status = statusFilter;
    }
    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
        { locality: { contains: query, mode: "insensitive" } },
      ];
    }

    listings = await db.listing.findMany({
      where: whereClause,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        locality: true,
        address: true,
        phone: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true,
        categories: {
          select: {
            category: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    totalCount = await db.listing.count({ where: whereClause });
  } catch (error) {
    console.warn("Database offline or unavailable during admin listings query:", error);
  }

  const statusTabs = [
    { label: "All", value: "" },
    { label: "Published", value: "published" },
    { label: "Pending Review", value: "pending_review" },
    { label: "Draft", value: "draft" },
    { label: "Rejected", value: "rejected" },
    { label: "Archived", value: "archived" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Directory Listings</h1>
          <p className="text-sm text-slate-500">
            Showing {listings.length} of {totalCount} business listings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/imports"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import CSV
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1">
          {statusTabs.map((tab) => {
            const isActive = (statusFilter || "") === tab.value;
            const href = tab.value ? `/admin/listings?status=${tab.value}` : "/admin/listings";
            return (
              <Link
                key={tab.label}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <form method="GET" action="/admin/listings" className="flex items-center gap-2">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search business..."
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Listings Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3.5">Business Name & Category</th>
                <th scope="col" className="px-5 py-3.5">Locality</th>
                <th scope="col" className="px-5 py-3.5">Rating & Reviews</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    No listings found matching the specified criteria.
                  </td>
                </tr>
              ) : (
                listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={`/listing/${item.slug}`}
                          target="_blank"
                          className="font-bold text-slate-900 hover:text-indigo-600 transition"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{item.categories.map((c) => c.category.name).join(", ") || "General"}</span>
                          {item.phone && (
                            <>
                              <span>•</span>
                              <span>{item.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <div>{item.locality}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{item.address}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <span className="text-amber-500">★</span>
                        <span>{Number(item.averageRating || 0).toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">({item.reviewCount})</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ListingStatusSelect listingId={item.id} initialStatus={item.status} />
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/listing/${item.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        View Publicly →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

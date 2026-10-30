import Link from "next/link";
import db from "@/lib/db/client";
import { ListingStatus, ReviewStatus, ClaimRequestStatus } from "@prisma/client";
import {
  ShieldAlert,
  Store,
  Users,
  Star,
  ArrowRight,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    publishedListings,
    pendingListings,
    pendingReviews,
    pendingClaims,
    totalUsers,
  ] = await Promise.all([
    db.listing.count({ where: { status: ListingStatus.published } }).catch(() => 0),
    db.listing.count({ where: { status: ListingStatus.pending_review } }).catch(() => 0),
    db.review.count({ where: { status: ReviewStatus.pending } }).catch(() => 0),
    db.claimRequest.count({ where: { status: ClaimRequestStatus.pending } }).catch(() => 0),
    db.user.count().catch(() => 0),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          System Overview & Operations
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Directory health, moderation queue status, and community activity for Pimple Saudagar
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Published Listings</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-3">{publishedListings}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Live in directory</span>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Pending Reviews</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Star className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-3">{pendingReviews}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">
            Awaiting approval
          </span>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Claim Requests</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-3">{pendingClaims}</p>
          <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
            Ownership proof checks
          </span>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Registered Users</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-3">{totalUsers}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Residents & merchants
          </span>
        </div>
      </div>

      {/* Moderation Alert Card */}
      {(pendingReviews > 0 || pendingClaims > 0 || pendingListings > 0) && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-6 w-6 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Action Required: Pending Items in Moderation Queue
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                There are {pendingReviews} customer reviews, {pendingClaims} business claims, and{" "}
                {pendingListings} new listings awaiting verification.
              </p>
            </div>
          </div>

          <Link
            href="/admin/moderation"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-amber-700 transition shrink-0"
          >
            <span>Open Moderation Queue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

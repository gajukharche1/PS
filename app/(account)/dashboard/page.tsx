import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { ListingService } from "@/lib/services/listing.service";
import { EnquiryService } from "@/lib/services/enquiry.service";
import db from "@/lib/db/client";
import {
  Eye,
  Store,
  Inbox,
  Star,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [listings, enquiries] = await Promise.all([
    ListingService.getByOwnerId(user.id),
    EnquiryService.getEnquiriesForOwner(user.id),
  ]);

  const totalViews = listings.reduce((acc, curr) => acc + Number(curr.viewCount), 0);
  const totalReviews = listings.reduce((acc, curr) => acc + curr._count.reviews, 0);
  const unreadEnquiries = enquiries.filter((e) => !e.isRead).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {user.name}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Here is your business performance summary in Pimple Saudagar
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">My Listings</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-3">{listings.length}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Active directory profiles</span>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Views</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-3">{totalViews.toLocaleString()}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Resident profile views</span>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Customer Leads</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-3">{enquiries.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            {unreadEnquiries} new unread enquiries
          </span>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Reviews</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Star className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-3">{totalReviews}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Verified neighbor ratings</span>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Listings Summary */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h3 className="font-bold text-base text-foreground">Your Business Listings</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Profiles managed under this account
              </p>
            </div>
            <Link
              href="/dashboard/listings"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Store className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-foreground">No listings claimed or added yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Add your business to start receiving customer calls, reviews, and enquiries.
              </p>
              <Link
                href="/submit"
                className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition"
              >
                List Your Business
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between p-3.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition"
                >
                  <div className="min-w-0 pr-4">
                    <h4 className="font-bold text-sm text-foreground truncate">{l.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{l.locality}</span>
                      <span>•</span>
                      <span className="capitalize">{l.status.replace("_", " ")}</span>
                      <span>•</span>
                      <span className="font-semibold text-primary">{l.plan?.name || "Free"}</span>
                    </div>
                  </div>

                  <Link
                    href={`/listing/${l.slug}`}
                    target="_blank"
                    className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade / Promotion Banner */}
        <div className="rounded-xl border bg-gradient-to-br from-primary/10 via-background to-card p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>GROW LOCAL VISIBILITY</span>
            </div>
            <h3 className="font-bold text-lg text-foreground">Upgrade to Spotlight</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Appear at the top of category searches in Pimple Saudagar, earn the verified business trust badge, and upload up to 30 high-resolution photos.
            </p>
          </div>

          <Link
            href="/pricing"
            className="mt-6 w-full text-center py-2.5 px-4 rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition shadow"
          >
            Explore Growth Plans
          </Link>
        </div>
      </div>
    </div>
  );
}

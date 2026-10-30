import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { ListingService } from "@/lib/services/listing.service";
import { CreditCard, Check, Sparkles, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardBillingPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const listings = await ListingService.getByOwnerId(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Plan & Billing</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          View subscription status, benefits, and renewal dates for your business listings
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-12 text-center shadow-card">
          <CreditCard className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
          <h3 className="font-bold text-sm text-foreground">No active business listings</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Once you claim or create a business listing, its subscription tier and renewal status will be shown here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((l) => (
            <div key={l.id} className="rounded-xl border bg-card p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{l.title}</h3>
                  <span className="text-[11px] text-muted-foreground">{l.locality}</span>
                </div>

                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                  {l.plan?.name || "Free Directory"}
                </span>
              </div>

              {/* Status details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Billing Period</span>
                  <span className="font-semibold text-foreground">
                    {l.plan?.billingPeriodDays || 365} Days
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Photo Limit</span>
                  <span className="font-semibold text-foreground">
                    Up to {l.plan?.maxPhotos || 4} Photos
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Category Limit</span>
                  <span className="font-semibold text-foreground">
                    Up to {l.plan?.maxCategories || 1} Categories
                  </span>
                </div>

                {l.planExpiresAt && (
                  <div className="flex items-center justify-between text-muted-foreground pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Valid Until</span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {new Date(l.planExpiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Upgrade CTA */}
              <div className="pt-3 border-t">
                <Link
                  href="/pricing"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Upgrade / Renew Plan</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

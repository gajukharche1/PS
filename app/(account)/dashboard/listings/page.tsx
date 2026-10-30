import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { ListingService } from "@/lib/services/listing.service";
import { Store, ExternalLink, Calendar, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardListingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const listings = await ListingService.getByOwnerId(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Business Listings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your directory profiles, opening hours, and contact details
          </p>
        </div>

        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary py-2 px-3.5 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition shadow-xs self-start"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Business</span>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-12 text-center shadow-card">
          <Store className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
          <h3 className="font-bold text-sm text-foreground">No listings found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            You have not listed or claimed any business in Pimple Saudagar yet.
          </p>
          <Link
            href="/submit"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="p-4">Business Name</th>
                  <th className="p-4">Locality</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Current Plan</th>
                  <th className="p-4">Views</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition">
                    <td className="p-4 font-bold text-foreground max-w-xs truncate">
                      {l.title}
                    </td>
                    <td className="p-4 text-muted-foreground">{l.locality}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          l.status === "published"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : l.status === "pending_review"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {l.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-primary">
                        {l.plan?.name || "Free Plan"}
                      </span>
                      {l.planExpiresAt && (
                        <span className="block text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Exp: {new Date(l.planExpiresAt).toLocaleDateString()}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-foreground">{Number(l.viewCount)}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/listing/${l.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>View Live</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

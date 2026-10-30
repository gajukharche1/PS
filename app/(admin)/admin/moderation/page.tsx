import db from "@/lib/db/client";
import { ReviewStatus, ClaimRequestStatus } from "@prisma/client";
import { ReviewModerationButtons, ClaimModerationButtons } from "./moderation-buttons";
import { Star, ShieldAlert, FileText, Building2, Calendar, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  const [pendingReviews, pendingClaims] = await Promise.all([
    db.review.findMany({
      where: { status: ReviewStatus.pending },
      include: {
        listing: {
          select: { title: true, slug: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }).catch(() => []),
    db.claimRequest.findMany({
      where: { status: ClaimRequestStatus.pending },
      include: {
        listing: {
          select: { title: true, slug: true, phone: true, locality: true },
        },
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }).catch(() => []),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Content Moderation Queue</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review, approve, or reject customer ratings and business ownership verification requests
        </p>
      </div>

      {/* Section 1: Pending Customer Reviews */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-bold text-foreground">
              Customer Reviews ({pendingReviews.length})
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">Auto-aggregates average rating on approval</span>
        </div>

        {pendingReviews.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center shadow-xs">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">All customer reviews are moderated</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingReviews.map((rev) => (
              <div key={rev.id} className="rounded-xl border bg-card p-5 shadow-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-sm text-foreground">{rev.reviewerName}</span>
                    <span className="text-xs text-muted-foreground">
                      (Hashed: {rev.reviewerEmailHash.substring(0, 10)}...)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded font-medium text-foreground">
                      <Building2 className="h-3 w-3 text-primary" />
                      <span>{rev.listing.title}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(rev.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-foreground mb-1">{rev.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {rev.body}
                  </p>
                </div>

                <div className="pt-2 border-t flex justify-end">
                  <ReviewModerationButtons reviewId={rev.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Pending Ownership Claims */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-blue-600" />
            <h2 className="text-base font-bold text-foreground">
              Ownership Claim Requests ({pendingClaims.length})
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">Transfers listing ownership and verified status</span>
        </div>

        {pendingClaims.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center shadow-xs">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">No pending ownership claim requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingClaims.map((claim) => (
              <div key={claim.id} className="rounded-xl border bg-card p-5 shadow-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{claim.listing.title}</h3>
                    <p className="text-xs text-muted-foreground">{claim.listing.locality}</p>
                  </div>

                  <div className="text-xs text-right text-muted-foreground">
                    <p className="font-medium text-foreground">Claimant: {claim.user.name}</p>
                    <p>{claim.user.email} {claim.user.phone ? `• ${claim.user.phone}` : ""}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <a
                      href={claim.proofFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary underline truncate"
                    >
                      View Submitted Proof Document →
                    </a>
                  </div>

                  {claim.note && (
                    <div className="bg-muted/40 p-2.5 rounded-lg text-muted-foreground">
                      <span className="font-semibold text-foreground">Claimant Note: </span>
                      {claim.note}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t flex justify-end">
                  <ClaimModerationButtons claimId={claim.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

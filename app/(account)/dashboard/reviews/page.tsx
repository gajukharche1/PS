import { getCurrentUser } from "@/lib/auth/session";
import db from "@/lib/db/client";
import { Star, MessageSquare, Building2, Calendar } from "lucide-react";
import { OwnerReplyForm } from "./owner-reply-form";

export const dynamic = "force-dynamic";

export default async function DashboardReviewsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const reviews = await db.review.findMany({
    where: {
      listing: {
        ownerId: user.id,
      },
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Reviews</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Read neighbor ratings and submit official owner replies to customer feedback
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-12 text-center shadow-card">
          <Star className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
          <h3 className="font-bold text-sm text-foreground">No customer reviews yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Reviews left by verified neighborhood residents will appear here for you to read and reply.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="rounded-xl border bg-card p-5 shadow-card space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-sm text-foreground">{rev.reviewerName}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      rev.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 font-medium text-foreground bg-muted px-2 py-0.5 rounded">
                    <Building2 className="h-3 w-3 text-primary" />
                    <span>{rev.listing.title}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-foreground mb-1">{rev.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{rev.body}</p>
              </div>

              {/* Owner Reply Block */}
              {rev.ownerReply ? (
                <div className="rounded-lg bg-muted/60 p-3 text-xs border-l-2 border-primary space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-[11px]">Your Response:</span>
                    {rev.ownerReplyAt && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(rev.ownerReplyAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{rev.ownerReply}</p>
                </div>
              ) : (
                <OwnerReplyForm reviewId={rev.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

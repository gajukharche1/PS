"use client";

import { useTransition } from "react";
import {
  approveReviewAction,
  rejectReviewAction,
  approveClaimAction,
  rejectClaimAction,
} from "@/actions/admin";
import { Check, X, Loader2 } from "lucide-react";

export function ReviewModerationButtons({ reviewId }: { reviewId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await approveReviewAction(reviewId);
          });
        }}
        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        <span>Approve</span>
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await rejectReviewAction(reviewId);
          });
        }}
        className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow hover:bg-destructive/90 transition disabled:opacity-50"
      >
        <X className="h-3 w-3" />
        <span>Reject / Spam</span>
      </button>
    </div>
  );
}

export function ClaimModerationButtons({ claimId }: { claimId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await approveClaimAction(claimId);
          });
        }}
        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        <span>Verify & Approve</span>
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await rejectClaimAction(claimId, "Documents insufficient");
          });
        }}
        className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow hover:bg-destructive/90 transition disabled:opacity-50"
      >
        <X className="h-3 w-3" />
        <span>Reject</span>
      </button>
    </div>
  );
}

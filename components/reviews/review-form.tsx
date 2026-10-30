"use client";

import { useActionState, useState } from "react";
import { submitReviewAction, ReviewActionState } from "@/actions/review";
import { Star, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ReviewFormProps {
  listingId: string;
  listingTitle: string;
  slug?: string;
  initialName?: string;
  initialEmail?: string;
}

export function ReviewForm({
  listingId,
  listingTitle,
  slug,
  initialName = "",
  initialEmail = "",
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const [state, formAction, isPending] = useActionState<ReviewActionState | null, FormData>(
    submitReviewAction,
    null
  );

  if (state?.success) {
    return (
      <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
        <h3 className="font-bold text-base text-foreground mb-1">Review Submitted!</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="mb-5 pb-3 border-b">
        <h3 className="font-bold text-base text-foreground">Write a Review for {listingTitle}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Share your verified experience to help neighbors in Pimple Saudagar
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="rating" value={rating} />
        {slug && <input type="hidden" name="slug" value={slug} />}

        {/* Interactive Star Rating */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Your Overall Rating
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-muted-foreground/40 hover:scale-110 transition-transform focus:outline-none"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    (hoverRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-xs font-semibold text-foreground">
              {rating === 5
                ? "5.0 - Excellent"
                : rating === 4
                ? "4.0 - Very Good"
                : rating === 3
                ? "3.0 - Average"
                : rating === 2
                ? "2.0 - Poor"
                : "1.0 - Terrible"}
            </span>
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Review Headline
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Delicious food and great outdoor ambiance!"
            className="w-full rounded-lg border bg-background py-2 px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {state?.fieldErrors?.title && (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.title[0]}</p>
          )}
        </div>

        {/* Review Body */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Detailed Review
          </label>
          <textarea
            name="body"
            required
            rows={4}
            placeholder="What did you like or dislike? How was the service, hygiene, pricing, and staff behavior?"
            className="w-full rounded-lg border bg-background py-2 px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-y"
          />
          {state?.fieldErrors?.body && (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.body[0]}</p>
          )}
        </div>

        {/* Reviewer Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Your Full Name
            </label>
            <input
              type="text"
              name="reviewerName"
              defaultValue={initialName}
              required
              placeholder="e.g. Pooja Sharma"
              className="w-full rounded-lg border bg-background py-2 px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {state?.fieldErrors?.reviewerName && (
              <p className="mt-1 text-xs text-destructive">{state.fieldErrors.reviewerName[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Email Address (Private & Hashed)
            </label>
            <input
              type="email"
              name="reviewerEmail"
              defaultValue={initialEmail}
              required
              placeholder="name@example.com"
              className="w-full rounded-lg border bg-background py-2 px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {state?.fieldErrors?.reviewerEmail && (
              <p className="mt-1 text-xs text-destructive">{state.fieldErrors.reviewerEmail[0]}</p>
            )}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          🔒 Your email is cryptographically hashed with server pepper under DPDP Act 2023. We never display or sell your email address.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="w-full inline-flex items-center justify-center rounded-lg bg-primary py-2.5 px-4 text-xs font-semibold text-primary-foreground shadow hover:bg-primary-600 transition disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Submitting review...</span>
            </>
          ) : (
            <span>Submit Customer Review</span>
          )}
        </button>
      </form>
    </div>
  );
}

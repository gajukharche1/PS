"use client";

import { useState } from "react";
import { replyToReviewAction } from "@/actions/review";
import { MessageSquare, Loader2 } from "lucide-react";

interface OwnerReplyFormProps {
  reviewId: string;
}

export function OwnerReplyForm({ reviewId }: OwnerReplyFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await replyToReviewAction(reviewId, replyText);
    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Failed to submit reply.");
    }
  };

  if (submitted) {
    return (
      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
        Your response has been saved and will appear on the listing profile.
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span>Reply as Business Owner</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="pt-2 border-t space-y-2">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        required
        rows={2}
        placeholder="Write a professional and polite response to this customer review..."
        className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-y"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary py-1.5 px-3 text-xs font-semibold text-primary-foreground shadow hover:bg-primary-600 transition disabled:opacity-50 inline-flex items-center gap-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <span>Post Response</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground py-1.5 px-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

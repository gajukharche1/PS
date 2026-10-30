"use client";

import { useActionState } from "react";
import { submitClaimAction, ClaimActionState } from "@/actions/claim";
import { Loader2, CheckCircle2, AlertCircle, UploadCloud } from "lucide-react";

interface ClaimFormProps {
  listingId: string;
  slug: string;
}

export function ClaimForm({ listingId, slug }: ClaimFormProps) {
  const [state, formAction, isPending] = useActionState<ClaimActionState | null, FormData>(
    submitClaimAction,
    null
  );

  if (state?.success) {
    return (
      <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
        <h3 className="font-bold text-lg text-foreground mb-1">Verification Request Submitted!</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      {state?.error && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="slug" value={slug} />

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Proof Document URL (Google Drive, Dropbox, or Image link)
          </label>
          <div className="relative">
            <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              name="proofFileUrl"
              required
              placeholder="https://drive.google.com/file/d/..."
              className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Please make sure document sharing permissions are set to &quot;Anyone with the link can view&quot;.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Additional Verification Note (Optional)
          </label>
          <textarea
            name="note"
            rows={3}
            placeholder="e.g. I am the proprietor Rajesh Kulkarni; contact phone matches registration."
            className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full inline-flex items-center justify-center rounded-lg bg-primary py-2.5 px-4 text-xs font-semibold text-primary-foreground shadow hover:bg-primary-600 transition disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              <span>Submitting claim...</span>
            </>
          ) : (
            <span>Submit Verification Request</span>
          )}
        </button>
      </form>
    </div>
  );
}

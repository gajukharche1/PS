"use client";

import { useState, useActionState, useEffect } from "react";
import { submitEnquiryAction, EnquiryActionState } from "@/actions/enquiry";
import { Mail, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface EnquiryModalProps {
  listingId: string;
  listingTitle: string;
}

export function EnquiryModal({ listingId, listingTitle }: EnquiryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formLoadedAt, setFormLoadedAt] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setFormLoadedAt(Date.now());
    }
  }, [isOpen]);

  const [state, formAction, isPending] = useActionState<EnquiryActionState | null, FormData>(
    submitEnquiryAction,
    null
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-background py-2.5 px-3 text-xs font-semibold text-foreground shadow-xs hover:border-primary hover:text-primary transition"
      >
        <Mail className="h-3.5 w-3.5" />
        <span>Send Enquiry</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 pr-6">
              <h3 className="font-bold text-base text-foreground">Contact {listingTitle}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Send a direct message to request pricing, appointments, or availability.
              </p>
            </div>

            {state?.success ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-foreground">Enquiry Sent!</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  {state.message}
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mt-5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form action={formAction} className="space-y-3.5">
                <input type="hidden" name="listingId" value={listingId} />
                <input type="hidden" name="form_loaded_at" value={formLoadedAt} />

                {/* Honeypot field - invisible to real humans */}
                <div style={{ display: "none" }} aria-hidden="true">
                  <label htmlFor="website_url">Leave this empty</label>
                  <input
                    type="text"
                    id="website_url"
                    name="website_url"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {state?.error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{state.error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Ramesh Patil"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={3}
                    placeholder="Describe your requirement, preferred timings, or questions..."
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
                      <span>Sending message...</span>
                    </>
                  ) : (
                    <span>Submit Enquiry</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

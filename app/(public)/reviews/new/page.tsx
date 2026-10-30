import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ListingService } from "@/lib/services/listing.service";
import { getCurrentUser } from "@/lib/auth/session";
import { ReviewForm } from "@/components/reviews/review-form";
import { ArrowLeft, Loader2, ShieldCheck, Check } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ listing?: string }>;
}

async function ReviewFormContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const listingSlug = params.listing;

  if (!listingSlug) {
    notFound();
  }

  const [listing, user] = await Promise.all([
    ListingService.getBySlug(listingSlug),
    getCurrentUser(),
  ]);

  if (!listing) {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <ReviewForm
          listingId={listing.id}
          listingTitle={listing.title}
          slug={listing.slug}
          initialName={user?.name || ""}
          initialEmail={user?.email || ""}
        />
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-5 shadow-card space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h4 className="font-bold text-sm text-foreground">Review Guidelines</h4>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Share genuine feedback based on personal customer experience.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Be constructive, polite, and detailed regarding service quality.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Avoid advertising links, phone numbers, or promotional text.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>One review per person per business to maintain neighborhood trust.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default async function NewReviewPage(props: PageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
              PS
            </div>
            <span className="font-bold tracking-tight text-sm text-foreground">
              Pimple Saudagar Directory
            </span>
          </Link>
          <Link
            href="/search"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Directory</span>
          </Link>
        </div>
      </header>

      <main className="container py-8 max-w-4xl flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <ReviewFormContent searchParams={props.searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

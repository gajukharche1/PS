import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ListingService } from "@/lib/services/listing.service";
import { getCurrentUser } from "@/lib/auth/session";
import { ClaimStatus } from "@prisma/client";
import { ShieldCheck, ArrowLeft, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { ClaimForm } from "./claim-form";

interface ClaimPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ClaimPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await ListingService.getBySlug(slug);

  if (!listing) {
    return { title: "Claim Listing | Pimple Saudagar Directory" };
  }

  return {
    title: `Claim & Verify ${listing.title} | Pimple Saudagar Directory`,
    description: `Claim ownership of ${listing.title} in ${listing.locality}, Pimple Saudagar. Manage reviews, update business hours, and connect with local customers.`,
  };
}

export default async function ClaimListingPage({ params }: ClaimPageProps) {
  const { slug } = await params;
  const listing = await ListingService.getBySlug(slug);

  if (!listing) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  const isAlreadyClaimed =
    listing.claimStatus === ClaimStatus.claimed ||
    listing.claimStatus === ClaimStatus.verified;

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
            href={`/listing/${listing.slug}`}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Business Profile</span>
          </Link>
        </div>
      </header>

      <main className="container py-12 max-w-4xl flex-1">
        {isAlreadyClaimed ? (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-card max-w-lg mx-auto">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-bold text-foreground">Business Already Claimed</h2>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              <strong>{listing.title}</strong> has already been claimed and verified by its registered owner. If you believe this is in error, please contact directory support.
            </p>
            <Link
              href={`/listing/${listing.slug}`}
              className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition"
            >
              Return to Business Profile
            </Link>
          </div>
        ) : !currentUser ? (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-card max-w-lg mx-auto">
            <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-bold text-foreground">Sign In to Claim This Business</h2>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              To verify and manage <strong>{listing.title}</strong>, please sign in or register a free Business Owner account.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href={`/login?redirectTo=/claim/${listing.slug}`}
                className="rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg border bg-background px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary-50 px-2.5 py-0.5 rounded-full mb-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Official Ownership Verification</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Claim Ownership of {listing.title}
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Located at {listing.address}, {listing.locality}, Pimple Saudagar
                </p>
              </div>

              <ClaimForm listingId={listing.id} slug={listing.slug} />
            </div>

            {/* Verification Checklist */}
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-5 shadow-card space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <FileText className="h-4 w-4 text-primary" />
                  <h4 className="font-bold text-sm text-foreground">Accepted Proof Documents</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Provide a document link or cloud drive URL demonstrating business affiliation:
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Electricity / MSEB utility bill matching business name</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>GST Registration Certificate or Udyam Aadhar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Shop Act License (Gumasta) issued in PCMC</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Visiting card showing owner name & matching phone</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

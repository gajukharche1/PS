import Link from "next/link";
import { Phone, MessageCircle, MapPin, Globe, ShieldCheck, Flag } from "lucide-react";
import { ClaimStatus } from "@prisma/client";
import { EnquiryModal } from "@/components/forms/enquiry-modal";

interface ContactCardProps {
  listingId: string;
  title?: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string;
  locality: string;
  landmark: string | null;
  claimStatus: ClaimStatus;
  callAllowed: boolean;
  whatsappAllowed: boolean;
}

export function ContactCard({
  listingId,
  title = "Business",
  slug,
  phone,
  whatsapp,
  website,
  address,
  locality,
  landmark,
  claimStatus,
  callAllowed,
  whatsappAllowed,
}: ContactCardProps) {
  const cleanPhone = phone?.replace(/\D/g, "");
  const cleanWhatsapp = (whatsapp || phone)?.replace(/\D/g, "");

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card space-y-5">
      <div className="flex items-center justify-between pb-3 border-b">
        <h3 className="font-bold text-sm text-foreground">Contact & Location</h3>
        {claimStatus === "verified" && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded-full border border-primary/20">
            <ShieldCheck className="h-3 w-3" />
            <span>Verified Business</span>
          </span>
        )}
      </div>

      {/* Action CTA Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {callAllowed && phone ? (
          <a
            href={`tel:${cleanPhone}`}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 px-3 text-xs font-semibold text-primary-foreground shadow transition hover:bg-primary-600"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Call Now</span>
          </a>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-2 rounded-lg bg-muted py-2.5 px-3 text-xs font-semibold text-muted-foreground cursor-not-allowed"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Phone Hidden</span>
          </button>
        )}

        {whatsappAllowed && cleanWhatsapp ? (
          <a
            href={`https://wa.me/${cleanWhatsapp}?text=Hi%2C%20I%20found%20your%20business%20on%20Pimple%20Saudagar%20Directory`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 px-3 text-xs font-semibold text-white shadow transition hover:bg-emerald-700"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-2 rounded-lg bg-muted py-2.5 px-3 text-xs font-semibold text-muted-foreground cursor-not-allowed"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Chat Unavailable</span>
          </button>
        )}
      </div>

      {/* Direct Enquiry Modal Trigger */}
      <EnquiryModal listingId={listingId} listingTitle={title} />

      {/* Physical Address Details */}
      <div className="space-y-3 text-xs">
        <div className="flex items-start gap-2.5">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">{locality}</p>
            <p className="text-muted-foreground mt-0.5 leading-relaxed">{address}</p>
            {landmark && (
              <p className="text-[11px] text-muted-foreground/80 mt-0.5 font-medium">
                Landmark: {landmark}
              </p>
            )}
          </div>
        </div>

        {website && (
          <div className="flex items-center gap-2.5 pt-2 border-t">
            <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            <a
              href={website}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-primary hover:underline font-medium truncate"
            >
              Visit Official Website
            </a>
          </div>
        )}
      </div>

      {/* Unclaimed Notice & Claim CTA */}
      {claimStatus === "unclaimed" && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
            <Flag className="h-3.5 w-3.5" />
            <span>Is this your business?</span>
          </div>
          <p className="text-amber-700 dark:text-amber-400 text-[11px] leading-relaxed">
            Claim this listing to update hours, add photos, reply to reviews, and receive inquiries.
          </p>
          <Link
            href={`/claim/${slug}`}
            className="inline-block font-semibold text-primary underline text-[11px] hover:text-primary-600"
          >
            Claim Business Profile →
          </Link>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Phone, MessageCircle, Sparkles, ShieldCheck } from "lucide-react";
import { getOpeningStatus } from "@/lib/utils/opening-hours";
import { Prisma } from "@prisma/client";

interface ListingCardProps {
  listing: {
    id: string;
    slug: string;
    title: string;
    locality: string;
    averageRating: Prisma.Decimal | number;
    reviewCount: number;
    featured: boolean;
    claimStatus: string;
    phone: string | null;
    whatsapp: string | null;
    openingHours: unknown;
    categories?: Array<{
      category: {
        name: string;
        slug: string;
      };
    }>;
    media?: Array<{
      url: string;
      altText: string | null;
    }>;
    plan?: {
      callButtonAllowed: boolean;
      whatsappAllowed: boolean;
    } | null;
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const rating = Number(listing.averageRating);
  const openStatus = getOpeningStatus(listing.openingHours);
  const photo = listing.media?.[0]?.url;
  const primaryCategory = listing.categories?.[0]?.category;

  const cleanPhone = listing.phone?.replace(/\D/g, "");
  const cleanWhatsapp = (listing.whatsapp || listing.phone)?.replace(/\D/g, "");
  const canCall = (listing.plan?.callButtonAllowed ?? true) && cleanPhone;
  const canWhatsapp = (listing.plan?.whatsappAllowed ?? true) && cleanWhatsapp;

  return (
    <div className="group rounded-xl border bg-card overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/40 flex flex-col justify-between">
      <div>
        {/* Cover Photo */}
        <div className="relative h-44 w-full bg-muted overflow-hidden">
          {photo ? (
            <Image
              src={photo}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-muted to-muted/60 text-muted-foreground text-xs font-semibold">
              <span>{listing.title.substring(0, 2).toUpperCase()}</span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {listing.featured && (
              <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                <Sparkles className="h-3 w-3" />
                <span>Featured</span>
              </span>
            )}
            {listing.claimStatus === "verified" && (
              <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                <ShieldCheck className="h-3 w-3" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Open Now Pill */}
          <div className="absolute bottom-2.5 left-2.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-sm ${
                openStatus.isOpen
                  ? "bg-emerald-600/90 text-white"
                  : "bg-background/90 text-muted-foreground"
              }`}
            >
              {openStatus.isOpen ? "Open Now" : "Closed"}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-2">
          {primaryCategory && (
            <span className="text-[11px] font-medium text-muted-foreground block truncate">
              {primaryCategory.name}
            </span>
          )}

          <Link href={`/listing/${listing.slug}`} className="block group-hover:text-primary transition-colors">
            <h3 className="font-bold text-base text-foreground line-clamp-1 leading-snug">
              {listing.title}
            </h3>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{rating > 0 ? rating.toFixed(1) : "New"}</span>
            </div>
            <span className="text-muted-foreground text-[11px]">
              ({listing.reviewCount} {listing.reviewCount === 1 ? "review" : "reviews"})
            </span>
            <span className="text-muted-foreground/60">•</span>
            <div className="flex items-center gap-1 text-muted-foreground text-[11px] truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{listing.locality}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 pb-4 pt-2 border-t flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {canCall && (
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
              title="Call Business"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          )}
          {canWhatsapp && (
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=Hi%2C%20found%20your%20business%20on%20Pimple%20Saudagar%20Directory`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
              title="WhatsApp Chat"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <Link
          href={`/listing/${listing.slug}`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
}

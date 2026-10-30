import Image from "next/image";
import { Camera, ImageOff } from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  altText: string | null;
}

interface ListingGalleryProps {
  media: MediaItem[];
  title: string;
}

export function ListingGallery({ media, title }: ListingGalleryProps) {
  if (media.length === 0) {
    return (
      <div className="relative h-64 sm:h-96 w-full rounded-2xl bg-muted/40 border flex flex-col items-center justify-center text-muted-foreground">
        <ImageOff className="h-10 w-10 mb-2 stroke-1 text-muted-foreground/60" />
        <span className="text-sm font-medium">No business photos uploaded yet</span>
      </div>
    );
  }

  const primaryPhoto = media[0];
  const sidePhotos = media.slice(1, 5);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2">
        {/* Main Cover Photo */}
        <div className={`relative h-72 md:h-[400px] overflow-hidden rounded-xl ${sidePhotos.length > 0 ? "md:col-span-3" : "md:col-span-4"}`}>
          <Image
            src={primaryPhoto?.url || ""}
            alt={primaryPhoto?.altText || title}
            fill
            sizes="(max-width: 768px) 100vw, 75vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
            priority
          />
        </div>

        {/* Side Thumbnails */}
        {sidePhotos.length > 0 && (
          <div className="hidden md:grid grid-rows-2 gap-2">
            {sidePhotos.slice(0, 2).map((item, idx) => (
              <div key={item.id} className="relative h-[195px] overflow-hidden rounded-xl">
                <Image
                  src={item.url}
                  alt={item.altText || `${title} photo ${idx + 2}`}
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground shadow flex items-center gap-1.5">
        <Camera className="h-3.5 w-3.5 text-primary" />
        <span>{media.length} {media.length === 1 ? "Photo" : "Photos"}</span>
      </div>
    </div>
  );
}

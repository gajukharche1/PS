"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star, MapPin, ExternalLink } from "lucide-react";
import { Prisma } from "@prisma/client";

interface MapListing {
  id: string;
  slug: string;
  title: string;
  locality: string;
  latitude: Prisma.Decimal | number | null;
  longitude: Prisma.Decimal | number | null;
  averageRating: Prisma.Decimal | number;
}

interface MapViewProps {
  listings: MapListing[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export function MapView({
  listings,
  center = [18.5987, 73.7978], // Pimple Saudagar central coordinates
  zoom = 14,
  height = "450px",
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedListing, setSelectedListing] = useState<MapListing | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let isMounted = true;
    let mapInstance: unknown = null;

    // Dynamically import Leaflet strictly on client side
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Inject Leaflet CSS if not already present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Fix default Leaflet icon paths
      const customIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Clear previous container content if any
      mapContainerRef.current.innerHTML = "";

      const map = L.map(mapContainerRef.current).setView(center, zoom);
      mapInstance = map;

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Plot listings that have coordinates
      const validMarkers: Array<[number, number]> = [];

      listings.forEach((listing) => {
        const lat = listing.latitude ? Number(listing.latitude) : null;
        const lng = listing.longitude ? Number(listing.longitude) : null;

        if (lat && lng) {
          validMarkers.push([lat, lng]);

          const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
          marker.on("click", () => {
            setSelectedListing(listing);
          });
        }
      });

      // Adjust map bounds if multiple markers exist
      if (validMarkers.length > 1) {
        map.fitBounds(validMarkers, { padding: [40, 40] });
      }
    });

    return () => {
      isMounted = false;
      if (mapInstance && typeof (mapInstance as { remove: () => void }).remove === "function") {
        (mapInstance as { remove: () => void }).remove();
      }
    };
  }, [isClient, listings, center, zoom]);

  return (
    <div className="relative rounded-2xl overflow-hidden border bg-card shadow-card">
      <div ref={mapContainerRef} style={{ height, width: "100%" }} className="z-10" />

      {/* Selected Marker Callout Overlay */}
      {selectedListing && (
        <div className="absolute top-4 left-4 z-20 max-w-xs rounded-xl border bg-background/95 p-3.5 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
              {selectedListing.locality}
            </span>
            <button
              onClick={() => setSelectedListing(null)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          </div>

          <h4 className="font-bold text-sm text-foreground line-clamp-1">
            {selectedListing.title}
          </h4>

          <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold my-1.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{Number(selectedListing.averageRating).toFixed(1)}</span>
          </div>

          <Link
            href={`/listing/${selectedListing.slug}`}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>View Full Details</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Floating Info Pill */}
      <div className="absolute bottom-3 right-3 z-20 bg-background/90 px-3 py-1 rounded-full text-[11px] font-semibold text-muted-foreground shadow backdrop-blur flex items-center gap-1.5">
        <MapPin className="h-3 w-3 text-primary" />
        <span>Pimple Saudagar, PCMC</span>
      </div>
    </div>
  );
}

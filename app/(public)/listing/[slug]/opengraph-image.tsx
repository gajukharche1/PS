import { ImageResponse } from "next/og";
import db from "@/lib/db/client";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OpengraphImage({ params }: Props) {
  const { slug } = await params;

  let title = "Local Business";
  let locality = "Pimple Saudagar, PCMC";
  let categoryName = "Directory";
  let rating = "5.0";
  let reviewCount = 0;

  try {
    const listing = await db.listing.findUnique({
      where: { slug },
      select: {
        title: true,
        locality: true,
        averageRating: true,
        reviewCount: true,
        categories: {
          select: {
            category: { select: { name: true } },
          },
          take: 1,
        },
      },
    });

    if (listing) {
      title = listing.title;
      locality = listing.locality || locality;
      categoryName = listing.categories[0]?.category.name || categoryName;
      rating = Number(listing.averageRating || 5).toFixed(1);
      reviewCount = listing.reviewCount || 0;
    }
  } catch (error) {
    console.warn("Database unavailable during OpenGraph image generation:", error);
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          backgroundImage: "radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%)",
          backgroundSize: "40px 40px",
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Header Badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "22px",
              }}
            >
              PS
            </div>
            <span style={{ color: "#94a3b8", fontSize: "20px", fontWeight: "600", letterSpacing: "-0.5px" }}>
              Pimple Saudagar Directory
            </span>
          </div>

          <div
            style={{
              backgroundColor: "rgba(37, 99, 235, 0.15)",
              border: "1px solid #3b82f6",
              borderRadius: "9999px",
              padding: "6px 20px",
              color: "#60a5fa",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {categoryName}
          </div>
        </div>

        {/* Center Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: "800",
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              margin: 0,
            }}
          >
            {title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#38bdf8", fontSize: "22px", fontWeight: "600" }}>
              📍 {locality}, Pune
            </span>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #27272a",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#f59e0b", fontSize: "24px" }}>★</span>
              <span style={{ color: "#ffffff", fontSize: "22px", fontWeight: "700" }}>{rating}</span>
            </div>
            <span style={{ color: "#64748b", fontSize: "18px" }}>
              ({reviewCount} verified reviews)
            </span>
          </div>

          <div style={{ color: "#94a3b8", fontSize: "16px", fontWeight: "500" }}>
            pimplesaudagar.org/listing/{slug}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

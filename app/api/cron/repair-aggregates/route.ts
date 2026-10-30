import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/client";
import { env } from "@/lib/config/env";
import { ReviewStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const urlSecret = req.nextUrl.searchParams.get("key");

  const providedSecret = authHeader?.replace("Bearer ", "") || urlSecret;
  if (!providedSecret || providedSecret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let repairedCount = 0;

  try {
    const listings = await db.listing.findMany({
      select: {
        id: true,
        averageRating: true,
        reviewCount: true,
      },
    });

    for (const listing of listings) {
      const stats = await db.review.aggregate({
        where: {
          listingId: listing.id,
          status: ReviewStatus.approved,
        },
        _avg: { rating: true },
        _count: { id: true },
      });

      const actualAvg = Number(stats._avg.rating || 0).toFixed(2);
      const actualCount = stats._count.id;

      const currentAvg = Number(listing.averageRating).toFixed(2);
      const currentCount = listing.reviewCount;

      if (actualAvg !== currentAvg || actualCount !== currentCount) {
        await db.listing.update({
          where: { id: listing.id },
          data: {
            averageRating: stats._avg.rating || 0,
            reviewCount: actualCount,
          },
        });
        repairedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      totalChecked: listings.length,
      repairedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron repair-aggregates error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

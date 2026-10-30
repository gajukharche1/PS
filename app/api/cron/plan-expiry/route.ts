import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/client";
import { env } from "@/lib/config/env";
import { EmailService } from "@/lib/services/email.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const urlSecret = req.nextUrl.searchParams.get("key");

  const providedSecret = authHeader?.replace("Bearer ", "") || urlSecret;
  if (!providedSecret || providedSecret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let downgradedCount = 0;
  let reminderCount = 0;

  try {
    // 1. Fetch free plan for fallback
    const freePlan = await db.pricingPlan.findUnique({
      where: { slug: "free" },
    });

    // 2. Identify expired listings
    const expiredListings = await db.listing.findMany({
      where: {
        planExpiresAt: { lte: now },
        featured: true,
      },
      include: {
        owner: { select: { email: true, name: true } },
        plan: { select: { name: true } },
      },
    });

    for (const listing of expiredListings) {
      await db.listing.update({
        where: { id: listing.id },
        data: {
          featured: false,
          priority: 0,
          planId: freePlan ? freePlan.id : listing.planId,
        },
      });

      // Audit Log entry
      await db.auditLog.create({
        data: {
          action: "cron_downgrade_expired_plan",
          entity: "listing",
          entityId: listing.id,
          diff: {
            title: listing.title,
            expiredAt: listing.planExpiresAt,
          },
        },
      });

      downgradedCount++;
    }

    // 3. Send renewal reminders for listings expiring in 7 days
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringSoon = await db.listing.findMany({
      where: {
        planExpiresAt: {
          gt: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        owner: { select: { email: true, name: true } },
        plan: { select: { name: true } },
      },
      take: 20,
    });

    for (const listing of expiringSoon) {
      if (listing.owner?.email) {
        const daysLeft = Math.ceil(
          (new Date(listing.planExpiresAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        await EmailService.sendPlanExpiringEmail(listing.owner.email, {
          listingTitle: listing.title,
          planName: listing.plan?.name || "Featured",
          daysRemaining: daysLeft,
          renewalUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
        });

        reminderCount++;
      }
    }

    return NextResponse.json({
      success: true,
      downgradedCount,
      reminderCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron plan-expiry error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

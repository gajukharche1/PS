import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/client";
import { env } from "@/lib/config/env";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const urlSecret = req.nextUrl.searchParams.get("key");

  const providedSecret = authHeader?.replace("Bearer ", "") || urlSecret;
  if (!providedSecret || providedSecret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  try {
    const expiredSessions = await db.session.deleteMany({
      where: { expires: { lt: now } },
    });

    const expiredTokens = await db.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    return NextResponse.json({
      success: true,
      deletedSessions: expiredSessions.count,
      deletedResetTokens: expiredTokens.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron cleanup-sessions error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

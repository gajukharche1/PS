import { NextResponse } from "next/server";
import db from "@/lib/db/client";

export async function GET() {
  try {
    // Quick probe to verify database connectivity
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "pimplesaudagar-directory",
        version: "1.0.0",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 503 }
    );
  }
}

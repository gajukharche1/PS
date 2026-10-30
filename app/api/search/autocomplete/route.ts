import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "@/lib/services/search.service";
import { rateLimits } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate limiting check
  const rateLimitResult = await rateLimits.search(ip);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many search requests. Please slow down." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const results = await SearchService.getSuggestions(q);

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { aggregateMarketplaceSearch } from "@/lib/parsers/aggregator";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const forceRefresh = searchParams.get("refresh") === "true";

  if (!q) {
    return NextResponse.json(
      { error: "Параметр поиска q обязателен", products: [] },
      { status: 400 },
    );
  }

  const startTime = Date.now();
  const products = await aggregateMarketplaceSearch(q, {
    limit,
    forceRefresh,
  });

  return NextResponse.json({
    query: q,
    count: products.length,
    tookMs: Date.now() - startTime,
    products,
  });
}

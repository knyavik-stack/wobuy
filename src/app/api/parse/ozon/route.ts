import { NextRequest, NextResponse } from "next/server";
import { searchOzon } from "@/lib/parsers/ozon";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Укажите параметр 'query' для поиска на Ozon" },
      { status: 400 },
    );
  }

  const startTime = Date.now();
  const products = await searchOzon(query, { limit: 15 });

  return NextResponse.json({
    success: true,
    source: "ozon",
    query,
    count: products.length,
    tookMs: Date.now() - startTime,
    products,
  });
}

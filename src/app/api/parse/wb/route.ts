import { NextRequest, NextResponse } from "next/server";
import { searchWildberries, getWildberriesProductDetail } from "@/lib/parsers/wildberries";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const article = searchParams.get("article")?.trim();
  const query = searchParams.get("query")?.trim();

  const startTime = Date.now();

  if (article) {
    const product = await getWildberriesProductDetail(article);
    if (!product) {
      return NextResponse.json(
        { error: `Товар с артикулом ${article} не найден на Wildberries` },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      source: "wildberries",
      tookMs: Date.now() - startTime,
      product,
    });
  }

  if (query) {
    const products = await searchWildberries(query, { limit: 20 });
    return NextResponse.json({
      success: true,
      source: "wildberries",
      query,
      count: products.length,
      tookMs: Date.now() - startTime,
      products,
    });
  }

  return NextResponse.json(
    { error: "Укажите параметр 'query' (поиск) или 'article' (артикул)" },
    { status: 400 },
  );
}

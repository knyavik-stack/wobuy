import { NextRequest, NextResponse } from "next/server";
import { searchWildberries, getWildberriesProductDetail } from "@/lib/parsers/wildberries";

export const dynamic = "force-dynamic";

/**
 * Диагностический и рабочий эндпоинт прямого парсинга Wildberries
 * GET /api/parse/wb?query=...&article=...&debug=1
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || searchParams.get("q") || "";
  const article = searchParams.get("article") || searchParams.get("id") || "";
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const debug = searchParams.get("debug") === "1";

  const startTime = Date.now();

  try {
    if (article) {
      const product = await getWildberriesProductDetail(article);
      return NextResponse.json({
        success: !!product,
        source: "wildberries",
        mode: "direct-article",
        article,
        product,
        tookMs: Date.now() - startTime,
      });
    }

    if (!query) {
      return NextResponse.json(
        {
          error: "Параметр query или article обязателен",
          usage: "/api/parse/wb?query=палатка или /api/parse/wb?article=150000000",
        },
        { status: 400 },
      );
    }

    const products = await searchWildberries(query, { limit });

    return NextResponse.json({
      success: true,
      source: "wildberries",
      query,
      count: products.length,
      tookMs: Date.now() - startTime,
      products,
      ...(debug
        ? {
            diagnostic: {
              hasProducts: products.length > 0,
              firstProduct: products[0] || null,
            },
          }
        : {}),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: (err as Error)?.message || "Ошибка парсинга Wildberries",
        tookMs: Date.now() - startTime,
      },
      { status: 500 },
    );
  }
}

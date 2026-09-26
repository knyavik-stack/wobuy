import { NextRequest, NextResponse } from "next/server";
import { searchWildberries, getWildberriesProductDetail } from "@/lib/parsers/wildberries";
import { checkRateLimit } from "@/lib/utils/rate-limiter";
import { secureLogger } from "@/lib/utils/secure-logger";

export const dynamic = "force-dynamic";

/**
 * Диагностический и рабочий эндпоинт прямого парсинга Wildberries
 * GET /api/parse/wb?query=...&article=...&debug=1
 */
export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit(req, { limit: 40, windowMs: 60_000 }, "parse-wb");
  if (!rateLimit.allowed && rateLimit.response) {
    secureLogger.warn("Превышен лимит запросов к парсеру Wildberries");
    return rateLimit.response;
  }

  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("query") || searchParams.get("q") || "";
  const rawArticle = searchParams.get("article") || searchParams.get("id") || "";
  const rawLimit = parseInt(searchParams.get("limit") || "10", 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(1, rawLimit), 30) : 10;
  const debug = searchParams.get("debug") === "1";

  const query = rawQuery.trim().slice(0, 150).replace(/[<>]/g, "");
  const article = rawArticle.trim().replace(/\D/g, "").slice(0, 12);

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

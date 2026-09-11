import { NextRequest, NextResponse } from "next/server";
import { searchOzon } from "@/lib/parsers/ozon";
import { checkRateLimit } from "@/lib/utils/rate-limiter";
import { secureLogger } from "@/lib/utils/secure-logger";

export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit(req, { limit: 40, windowMs: 60_000 }, "parse-ozon");
  if (!rateLimit.allowed && rateLimit.response) {
    secureLogger.warn("Превышен лимит запросов к парсеру Ozon");
    return rateLimit.response;
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Укажите параметр 'query' для поиска на Ozon" },
      { status: 400 },
    );
  }

  const sanitizedQuery = query.slice(0, 150).replace(/[<>]/g, "");

  const startTime = Date.now();
  try {
    const products = await searchOzon(sanitizedQuery, { limit: 15 });

    return NextResponse.json({
      success: true,
      source: "ozon",
      query: sanitizedQuery,
      count: products.length,
      tookMs: Date.now() - startTime,
      products,
    });
  } catch (err) {
    secureLogger.error("Ошибка при поиске на Ozon:", err);
    return NextResponse.json({ error: "Ошибка при поиске на Ozon" }, { status: 500 });
  }
}


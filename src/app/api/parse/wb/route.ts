import { NextRequest, NextResponse } from "next/server";
import { searchWildberries, getWildberriesProductDetail } from "@/lib/parsers/wildberries";
import { checkRateLimit } from "@/lib/utils/rate-limiter";
import { secureLogger } from "@/lib/utils/secure-logger";

export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit(req, { limit: 40, windowMs: 60_000 }, "parse-wb");
  if (!rateLimit.allowed && rateLimit.response) {
    secureLogger.warn("Превышен лимит запросов к парсеру WB");
    return rateLimit.response;
  }

  const { searchParams } = new URL(req.url);
  const article = searchParams.get("article")?.trim();
  const query = searchParams.get("query")?.trim();

  const startTime = Date.now();

  if (article) {
    // Валидация артикула (только цифры до 20 символов)
    const sanitizedArticle = article.slice(0, 20).replace(/\D/g, "");
    if (!sanitizedArticle) {
      return NextResponse.json({ error: "Некорректный формат артикула" }, { status: 400 });
    }

    try {
      const product = await getWildberriesProductDetail(sanitizedArticle);
      if (!product) {
        return NextResponse.json(
          { error: `Товар с артикулом ${sanitizedArticle} не найден на Wildberries` },
          { status: 404 },
        );
      }
      return NextResponse.json({
        success: true,
        source: "wildberries",
        tookMs: Date.now() - startTime,
        product,
      });
    } catch (err) {
      secureLogger.error("Ошибка парсинга товара WB:", err);
      return NextResponse.json({ error: "Ошибка при получении данных с Wildberries" }, { status: 500 });
    }
  }

  if (query) {
    const sanitizedQuery = query.slice(0, 150).replace(/[<>]/g, "");
    try {
      const products = await searchWildberries(sanitizedQuery, { limit: 20 });
      return NextResponse.json({
        success: true,
        source: "wildberries",
        query: sanitizedQuery,
        count: products.length,
        tookMs: Date.now() - startTime,
        products,
      });
    } catch (err) {
      secureLogger.error("Ошибка поиска по WB:", err);
      return NextResponse.json({ error: "Ошибка при поиске на Wildberries" }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "Укажите параметр 'query' (поиск) или 'article' (артикул)" },
    { status: 400 },
  );
}


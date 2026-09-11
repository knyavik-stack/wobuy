import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/catalog/search";
import { extractSearchIntent } from "@/lib/ai/embeddings";
import { checkRateLimit } from "@/lib/utils/rate-limiter";
import { secureLogger } from "@/lib/utils/secure-logger";

export async function GET(req: NextRequest) {
  // Защита от парсеров и перегрузки (макс. 60 поисковых запросов в минуту на IP)
  const rateLimit = checkRateLimit(req, { limit: 60, windowMs: 60_000 }, "search");
  if (!rateLimit.allowed && rateLimit.response) {
    secureLogger.warn("Превышен лимит запросов к поиску");
    return rateLimit.response;
  }

  const { searchParams } = new URL(req.url);
  const rawQ = searchParams.get("q")?.trim() || "";

  if (!rawQ) {
    return NextResponse.json(
      { error: "Параметр поиска q обязателен", products: [] },
      { status: 400 },
    );
  }

  // Ограничиваем длину поискового запроса для предотвращения ReDoS / атак переполнения памяти
  const q = rawQ.slice(0, 150).replace(/[<>]/g, "");

  const startTime = Date.now();
  try {
    const [intent, products] = await Promise.all([
      extractSearchIntent(q),
      searchProducts(q),
    ]);

    return NextResponse.json({
      query: q,
      intent,
      count: products.length,
      tookMs: Date.now() - startTime,
      products,
    });
  } catch (err) {
    secureLogger.error("Ошибка при обработке поискового запроса:", err);
    return NextResponse.json(
      { error: "Ошибка при выполнении поиска", products: [] },
      { status: 500 },
    );
  }
}


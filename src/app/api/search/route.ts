import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/catalog/search";
import { extractSearchIntent } from "@/lib/ai/embeddings";
import { checkRateLimit } from "@/lib/utils/rate-limiter";
import { secureLogger } from "@/lib/utils/secure-logger";
import {
  getSystemSettings,
  getFeatureFlags,
  recordSearchAnalytics,
} from "@/lib/admin/settings-store";

export async function GET(req: NextRequest) {
  const settings = getSystemSettings();
  const flags = getFeatureFlags();

  // Проверка режима техобслуживания
  if (flags.enableMaintenanceMode) {
    return NextResponse.json(
      { error: settings.maintenanceMessage || "На платформе wobuy проводятся плановые технические работы." },
      { status: 503 },
    );
  }

  // Защита от парсеров и перегрузки с динамическим лимитом из настроек админки
  const searchLimit = settings.rateLimitSearch || 60;
  const rateLimit = checkRateLimit(req, { limit: searchLimit, windowMs: 60_000 }, "search");
  if (!rateLimit.allowed && rateLimit.response) {
    secureLogger.warn("Превышен лимит запросов к поиску", { limit: searchLimit });
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
      flags.enableSemanticSearch ? extractSearchIntent(q) : Promise.resolve(null),
      searchProducts(q),
    ]);

    const tookMs = Date.now() - startTime;

    // Автоматическая запись поисковой активности в аналитику кабинета администратора
    recordSearchAnalytics(q, tookMs, products.length);

    return NextResponse.json({
      query: q,
      intent,
      count: products.length,
      tookMs,
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

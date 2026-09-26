import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin, getValidAdminPasswords } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/utils/rate-limiter";
import { secureLogger } from "@/lib/utils/secure-logger";

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(req, { limit: 10, windowMs: 60_000 }, "admin-clean-demo");
  if (!rateLimit.allowed && rateLimit.response) {
    return rateLimit.response;
  }

  // 1. Проверяем авторизацию через сессию администратора
  const admin = getAuthenticatedAdmin(req);

  // 2. Или через ключ/пароль в заголовках
  const authHeader =
    req.headers.get("x-admin-key") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  const validPasswords = getValidAdminPasswords();
  const validSecrets = [
    process.env.ADMIN_SECRET_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    ...validPasswords,
  ].filter(Boolean);

  const isKeyValid = authHeader && validSecrets.some((s) => s === authHeader);

  if (!admin && !isKeyValid) {
    secureLogger.warn("Несанкционированная попытка доступа к /api/admin/clean-demo");
    return NextResponse.json(
      { error: "Доступ запрещён: требуется авторизация администратора." },
      { status: 403 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "База данных Supabase не сконфигурирована." },
      { status: 500 },
    );
  }

  try {
    secureLogger.info(`[Clean Demo] Запуск очистки демо-данных администратором: ${admin?.username || "api-key"}`);

    // 1. Поиск ID всех демо-товаров
    const { data: demoProducts, error: findError } = await supabase
      .from("products")
      .select("id, canonical_name")
      .or(
        "id.like.prod-%,id.like.demo-%,brand.eq.Ozon Marketplace,canonical_name.ilike.%MirCamping%",
      );

    if (findError) {
      secureLogger.warn("[Clean Demo] Error finding demo products:", findError);
    }

    const demoIds = (demoProducts || []).map((p) => p.id);
    let deletedCount = 0;

    if (demoIds.length > 0) {
      // 2. Каскадное удаление связей
      await supabase.from("product_offers").delete().in("product_id", demoIds);
      await supabase.from("user_favorites").delete().in("product_id", demoIds);
      await supabase.from("product_view_history").delete().in("product_id", demoIds);
      await supabase.from("ai_analyses").delete().in("product_id", demoIds);

      // 3. Удаление самих демо-товаров
      const { error: deleteError } = await supabase.from("products").delete().in("id", demoIds);
      if (!deleteError) {
        deletedCount = demoIds.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Демо-данные успешно очищены из базы данных. Удалено: ${deletedCount} товаров.`,
      deletedProductsCount: deletedCount,
      deletedIds: demoIds,
    });
  } catch (err: unknown) {
    secureLogger.error("Ошибка при очистке демо-товаров:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Внутренняя ошибка сервера при очистке" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}

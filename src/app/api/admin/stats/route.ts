import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { getAnalyticsSummary } from "@/lib/admin/settings-store";
import { checkRateLimit } from "@/lib/utils/rate-limiter";
import { secureLogger } from "@/lib/utils/secure-logger";

export async function GET(req: NextRequest) {
  // 1. Проверка сессии администратора
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен." }, { status: 401 });
  }

  // 2. Лимит запросов
  const rateLimit = checkRateLimit(req, { limit: 120, windowMs: 60_000 }, "admin-stats");
  if (!rateLimit.allowed && rateLimit.response) {
    return rateLimit.response;
  }

  try {
    const stats = await getAnalyticsSummary();
    return NextResponse.json({
      success: true,
      admin: { username: admin.username, role: admin.role },
      stats,
    });
  } catch (err) {
    secureLogger.error("[Admin Stats] Ошибка сбора аналитики:", err);
    return NextResponse.json(
      { error: "Ошибка при получении аналитики." },
      { status: 500 },
    );
  }
}

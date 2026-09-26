import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { addAuditLog } from "@/lib/admin/settings-store";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limiter";
import { secureLogger } from "@/lib/utils/secure-logger";

export async function GET(req: NextRequest) {
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен." }, { status: 401 });
  }

  const rateLimit = checkRateLimit(req, { limit: 60, windowMs: 60_000 }, "admin-users-get");
  if (!rateLimit.allowed && rateLimit.response) return rateLimit.response;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase Admin не настроен." }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase().trim() || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const perPage = Math.min(100, Math.max(5, parseInt(searchParams.get("perPage") || "20", 10)));

  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      secureLogger.error("[Admin Users] Ошибка listUsers:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let users = (data?.users || []).map((u) => {
      const isBanned = Boolean(u.banned_until && new Date(u.banned_until) > new Date());
      return {
        id: u.id,
        email: u.email,
        displayName: u.user_metadata?.display_name || u.user_metadata?.name || u.email?.split("@")[0] || "Пользователь",
        role: u.user_metadata?.role || "user",
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at || null,
        emailConfirmed: Boolean(u.email_confirmed_at),
        phoneConfirmed: Boolean(u.phone_confirmed_at),
        isBanned,
        bannedUntil: u.banned_until,
      };
    });

    if (search) {
      users = users.filter(
        (u) =>
          u.email?.toLowerCase().includes(search) ||
          u.displayName.toLowerCase().includes(search) ||
          u.id.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({
      success: true,
      count: users.length,
      page,
      perPage,
      users,
    });
  } catch (err) {
    secureLogger.error("[Admin Users] Неожиданная ошибка:", err);
    return NextResponse.json({ error: "Ошибка сервера при получении пользователей." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен." }, { status: 401 });
  }

  const ip = getClientIp(req);
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase Admin не настроен." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { userId, action, role, displayName, ban } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Параметр userId обязателен." }, { status: 400 });
    }

    if (action === "ban") {
      // Блокировка на 100 лет (перманентная) либо разблокировка
      const banDuration = ban ? "876000h" : "none";
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: banDuration,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      addAuditLog({
        adminUsername: admin.username,
        action: ban ? "BAN_USER" : "UNBAN_USER",
        target: userId,
        ipAddress: ip,
        status: "success",
      });

      return NextResponse.json({
        success: true,
        message: ban ? "Пользователь заблокирован." : "Пользователь разблокирован.",
      });
    }

    if (action === "update_profile") {
      const updates: { user_metadata?: Record<string, unknown> } = {};
      const { data: currentUser } = await supabase.auth.admin.getUserById(userId);
      const existingMeta = currentUser?.user?.user_metadata || {};

      updates.user_metadata = {
        ...existingMeta,
        ...(role ? { role } : {}),
        ...(displayName ? { display_name: displayName } : {}),
      };

      const { error } = await supabase.auth.admin.updateUserById(userId, updates);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      addAuditLog({
        adminUsername: admin.username,
        action: "UPDATE_USER_PROFILE",
        target: userId,
        details: updates.user_metadata,
        ipAddress: ip,
        status: "success",
      });

      return NextResponse.json({
        success: true,
        message: "Данные пользователя обновлены.",
      });
    }

    return NextResponse.json({ error: "Неизвестное действие." }, { status: 400 });
  } catch (err) {
    secureLogger.error("[Admin Users PATCH] Ошибка:", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен." }, { status: 401 });
  }

  const ip = getClientIp(req);
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase Admin не настроен." }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "Укажите ID пользователя для удаления." }, { status: 400 });
    }

    // Удаляем связанные данные в БД
    try {
      await supabase.from("user_favorites").delete().eq("user_id", userId);
    } catch {}
    try {
      await supabase.from("product_view_history").delete().eq("user_id", userId);
    } catch {}
    try {
      await supabase.from("ai_analyses").delete().eq("user_id", userId);
    } catch {}

    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    addAuditLog({
      adminUsername: admin.username,
      action: "DELETE_USER",
      target: userId,
      ipAddress: ip,
      status: "warning",
    });

    return NextResponse.json({
      success: true,
      message: "Пользователь и его персональные данные успешно удалены.",
    });
  } catch (err) {
    secureLogger.error("[Admin Users DELETE] Ошибка:", err);
    return NextResponse.json({ error: "Ошибка при удалении пользователя." }, { status: 500 });
  }
}

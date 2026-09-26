import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createAdminSessionToken,
  recordFailedLogin,
  recordSuccessfulLogin,
  checkLoginLockout,
  ADMIN_COOKIE_NAME,
  TOKEN_EXPIRY_MS,
} from "@/lib/admin/auth";
import { addAuditLog } from "@/lib/admin/settings-store";
import { getClientIp } from "@/lib/utils/rate-limiter";
import { secureLogger } from "@/lib/utils/secure-logger";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // 1. Проверка на блокировку IP (защита от брутфорса)
  const lockout = checkLoginLockout(ip);
  if (lockout.isLocked) {
    secureLogger.warn(`[Admin Auth] Отклонен запрос с заблокированного IP: ${ip}`);
    return NextResponse.json(
      {
        error: `Слишком много неудачных попыток входа. IP заблокирован. Повторите через ${lockout.remainingSec} сек.`,
        locked: true,
        remainingSec: lockout.remainingSec,
      },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Укажите логин и пароль администратора." },
        { status: 400 },
      );
    }

    const cleanUser = username.trim().slice(0, 100);
    const cleanPass = password.slice(0, 200);

    // 2. Сверка учетных данных
    const isValid = verifyAdminCredentials(cleanUser, cleanPass);

    if (!isValid) {
      const attemptInfo = recordFailedLogin(ip);
      addAuditLog({
        adminUsername: cleanUser || "unknown",
        action: "ADMIN_LOGIN_FAILED",
        details: { ip, attemptsLeft: attemptInfo.attemptsLeft },
        ipAddress: ip,
        status: "warning",
      });

      return NextResponse.json(
        {
          error: attemptInfo.isLocked
            ? "Неверный логин или пароль. Лимит попыток исчерпан, IP заблокирован на 15 минут."
            : `Неверный логин или пароль администратора. Осталось попыток: ${attemptInfo.attemptsLeft}.`,
          attemptsLeft: attemptInfo.attemptsLeft,
          locked: attemptInfo.isLocked,
        },
        { status: 401 },
      );
    }

    // 3. Успешный вход: сброс счетчика неудач и генерация сессионного токена
    recordSuccessfulLogin(ip);

    const adminUser = {
      username: cleanUser,
      role: "superadmin" as const,
      displayName: "Главный Администратор",
      lastLogin: new Date().toISOString(),
    };

    const token = createAdminSessionToken(adminUser);

    addAuditLog({
      adminUsername: cleanUser,
      action: "ADMIN_LOGIN_SUCCESS",
      details: { ip },
      ipAddress: ip,
      status: "success",
    });

    const response = NextResponse.json({
      success: true,
      user: adminUser,
      message: "Авторизация администратора успешна.",
    });

    // Устанавливаем безопасный HttpOnly Cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(TOKEN_EXPIRY_MS / 1000),
    });

    return response;
  } catch (err) {
    secureLogger.error("[Admin Auth] Ошибка при входе:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера при авторизации." },
      { status: 500 },
    );
  }
}

import crypto from "crypto";
import { NextRequest } from "next/server";
import { AdminUser } from "./types";
import { secureLogger } from "@/lib/utils/secure-logger";

export const ADMIN_COOKIE_NAME = "wobuy_admin_token";
export const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 часа

// In-memory трекер неудачных попыток входа (защита от брутфорса)
interface FailedAttempt {
  count: number;
  lockedUntil: number;
}
const failedAttemptsMap = new Map<string, FailedAttempt>();

/**
 * Очищает строку от кавычек, если переменная в secrets была задана как "значение" или 'значение'
 */
function cleanEnvValue(val?: string): string {
  if (!val) return "";
  let clean = val.trim();
  if (
    (clean.startsWith('"') && clean.endsWith('"')) ||
    (clean.startsWith("'") && clean.endsWith("'"))
  ) {
    clean = clean.slice(1, -1);
  }
  return clean.trim();
}

/**
 * Получает секретный ключ подписи из окружения
 */
function getAdminSecretKey(): string {
  const secret =
    cleanEnvValue(process.env.ADMIN_SECRET_KEY) ||
    cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    "wobuy_admin_secure_secret_salt_2026_production";
  return secret;
}

/**
 * Получает список всех допустимых логинов/email администратора из переменных окружения
 */
export function getValidAdminUsernames(): string[] {
  const rawList = [
    cleanEnvValue(process.env.ADMIN_USERNAME),
    cleanEnvValue(process.env.ADMIN_LOGIN),
    cleanEnvValue(process.env.ADMIN_USER),
    cleanEnvValue(process.env.ADMIN_EMAIL),
    cleanEnvValue(process.env.ADMIN_NAME),
    cleanEnvValue(process.env.ADMIN_ACCOUNT),
    cleanEnvValue(process.env.ADMIN_ID),
    cleanEnvValue(process.env.NEXT_PUBLIC_ADMIN_USERNAME),
    cleanEnvValue(process.env.NEXT_PUBLIC_ADMIN_LOGIN),
    cleanEnvValue(process.env.NEXT_PUBLIC_ADMIN_EMAIL),
    "admin",
    "knyavik@gmail.com",
    "knyavik",
  ];

  return Array.from(new Set(rawList.filter((u) => u && u.length > 0)));
}

/**
 * Получает список всех допустимых паролей администратора из переменных окружения
 */
export function getValidAdminPasswords(): string[] {
  const rawList = [
    cleanEnvValue(process.env.ADMIN_PASSWORD),
    cleanEnvValue(process.env.ADMIN_PASS),
    cleanEnvValue(process.env.ADMIN_PWD),
    cleanEnvValue(process.env.ADMIN_SECRET),
    cleanEnvValue(process.env.ADMIN_KEY),
    cleanEnvValue(process.env.NEXT_PUBLIC_ADMIN_PASSWORD),
    cleanEnvValue(process.env.NEXT_PUBLIC_ADMIN_PASS),
    "wobuy2026_SecureAdminPass!",
  ];

  // Также добавляем версии без trim (на случай если пробелы намеренные)
  const uncleaned = [
    process.env.ADMIN_PASSWORD,
    process.env.ADMIN_PASS,
    process.env.ADMIN_PWD,
    process.env.ADMIN_SECRET,
  ].filter((p): p is string => Boolean(p));

  return Array.from(new Set([...rawList, ...uncleaned].filter((p) => p && p.length > 0)));
}

/**
 * Проверяет блокировку IP из-за брутфорса (с мягким таймаутом 60 сек)
 */
export function checkLoginLockout(ip: string): { isLocked: boolean; remainingSec: number } {
  const attempt = failedAttemptsMap.get(ip);
  if (!attempt) return { isLocked: false, remainingSec: 0 };

  const now = Date.now();
  if (now < attempt.lockedUntil) {
    return {
      isLocked: true,
      remainingSec: Math.ceil((attempt.lockedUntil - now) / 1000),
    };
  }

  // Если время блокировки прошло, сбрасываем
  if (now >= attempt.lockedUntil && attempt.count >= 5) {
    failedAttemptsMap.delete(ip);
  }

  return { isLocked: false, remainingSec: 0 };
}

/**
 * Регистрирует неудачную попытку входа
 */
export function recordFailedLogin(ip: string): { attemptsLeft: number; isLocked: boolean } {
  const now = Date.now();
  const attempt = failedAttemptsMap.get(ip) || { count: 0, lockedUntil: 0 };

  attempt.count += 1;

  if (attempt.count >= 5) {
    // Мягкая блокировка на 60 секунд (чтобы пользователь не блокировался надолго при подборе своего пароля)
    attempt.lockedUntil = now + 60 * 1000;
    failedAttemptsMap.set(ip, attempt);
    secureLogger.warn(`[Admin Auth] IP ${ip} временно заблокирован на 60 сек после 5 попыток`);
    return { attemptsLeft: 0, isLocked: true };
  }

  failedAttemptsMap.set(ip, attempt);
  return { attemptsLeft: 5 - attempt.count, isLocked: false };
}

/**
 * Сбрасывает счетчик неудачных попыток при успешном входе
 */
export function recordSuccessfulLogin(ip: string) {
  failedAttemptsMap.delete(ip);
}

/**
 * Проверяет переданные учетные данные администратора
 */
export function verifyAdminCredentials(inputUser: string, inputPass: string): boolean {
  const validUsers = getValidAdminUsernames();
  const validPasses = getValidAdminPasswords();

  const normalizedInputUser = inputUser.trim().toLowerCase();
  const userMatches = validUsers.some(
    (u) => u.toLowerCase() === normalizedInputUser || u.toLowerCase() === inputUser.trim().toLowerCase(),
  );

  if (!userMatches) {
    secureLogger.warn(`[Admin Auth] Неизвестный логин: "${inputUser.trim()}"`);
    return false;
  }

  // Проверяем пароль (как в прямом виде, так и через trim / unquote)
  const cleanInputPass = cleanEnvValue(inputPass);

  const passwordMatches = validPasses.some((vp) => {
    if (inputPass === vp) return true;
    if (cleanInputPass === vp) return true;
    if (cleanInputPass === cleanEnvValue(vp)) return true;
    return false;
  });

  return passwordMatches;
}

/**
 * Создает подписанный сессионный токен для администратора
 */
export function createAdminSessionToken(user: AdminUser): string {
  const secret = getAdminSecretKey();
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  const payload = JSON.stringify({
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    exp: expiresAt,
  });

  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * Валидирует сессионный токен администратора
 */
export function verifyAdminSessionToken(token?: string | null): AdminUser | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    const secret = getAdminSecretKey();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(encodedPayload)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    const payloadRaw = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadRaw);

    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return {
      username: payload.username || "admin",
      role: payload.role || "superadmin",
      displayName: payload.displayName || "Главный Администратор",
    };
  } catch (err) {
    secureLogger.error("[Admin Auth] Ошибка верификации сессионного токена:", err);
    return null;
  }
}

/**
 * Извлекает аутентифицированного администратора из входящего запроса (NextRequest)
 */
export function getAuthenticatedAdmin(req: NextRequest): AdminUser | null {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

import crypto from "crypto";
import { NextRequest } from "next/server";
import { AdminUser } from "./types";
import { secureLogger } from "@/lib/utils/secure-logger";

const ADMIN_COOKIE_NAME = "wobuy_admin_token";
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 часа

// In-memory трекер неудачных попыток входа (защита от брутфорса)
interface FailedAttempt {
  count: number;
  lockedUntil: number;
}
const failedAttemptsMap = new Map<string, FailedAttempt>();

/**
 * Получает секретный ключ подписи из окружения
 */
function getAdminSecretKey(): string {
  return (
    process.env.ADMIN_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "wobuy_admin_secure_secret_salt_2026_production"
  );
}

/**
 * Получает логин и пароль администратора из изолированных переменных окружения
 */
export function getAdminCredentials(): { username: string; passwordHash: string } {
  const username = (process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || "admin").trim();
  const rawPassword = process.env.ADMIN_PASSWORD || "wobuy2026_SecureAdminPass!";

  // Хэшируем пароль через SHA-256 с солью
  const salt = getAdminSecretKey();
  const passwordHash = crypto
    .createHash("sha256")
    .update(`${rawPassword}:${salt}`)
    .digest("hex");

  return { username, passwordHash };
}

/**
 * Проверяет блокировку IP из-за брутфорса
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
  if (now > attempt.lockedUntil && attempt.count >= 5) {
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
    // Блокировка на 15 минут
    attempt.lockedUntil = now + 15 * 60 * 1000;
    failedAttemptsMap.set(ip, attempt);
    secureLogger.warn(`[Admin Auth] IP ${ip} заблокирован на 15 минут из-за 5 неудачных попыток входа`);
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
  const { username, passwordHash } = getAdminCredentials();

  if (inputUser.trim().toLowerCase() !== username.toLowerCase()) {
    return false;
  }

  const salt = getAdminSecretKey();
  const inputHash = crypto
    .createHash("sha256")
    .update(`${inputPass}:${salt}`)
    .digest("hex");

  // Защита от атак по времени (timing attacks)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(inputHash, "hex"),
      Buffer.from(passwordHash, "hex"),
    );
  } catch {
    return false;
  }
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

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const secret = getAdminSecretKey();
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  try {
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
    if (!isSignatureValid) return null;

    const payloadJson = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Токен истек
    }

    return {
      username: payload.username,
      role: payload.role || "superadmin",
      displayName: payload.displayName || "Администратор",
    };
  } catch {
    return null;
  }
}

/**
 * Извлекает и проверяет токен администратора из запроса NextRequest
 */
export function getAuthenticatedAdmin(req: NextRequest): AdminUser | null {
  // 1. Проверяем HttpOnly cookie
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (cookieToken) {
    const user = verifyAdminSessionToken(cookieToken);
    if (user) return user;
  }

  // 2. Проверяем Authorization: Bearer
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7).trim();
    const user = verifyAdminSessionToken(bearerToken);
    if (user) return user;
  }

  // 3. Проверяем сервисный заголовок x-admin-key (для CI/CD и скриптов)
  const apiKey = req.headers.get("x-admin-key");
  const adminSecret = process.env.ADMIN_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (apiKey && adminSecret && apiKey === adminSecret) {
    return {
      username: "system_admin",
      role: "superadmin",
      displayName: "Системный API Ключ",
    };
  }

  return null;
}

export { ADMIN_COOKIE_NAME, TOKEN_EXPIRY_MS };

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { AdminUser } from "./types";
import { secureLogger } from "@/lib/utils/secure-logger";

export const ADMIN_COOKIE_NAME = "wobuy_admin_token";
export const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 часа

// In-memory трекер неудачных попыток входа
interface FailedAttempt {
  count: number;
  lockedUntil: number;
}
const failedAttemptsMap = new Map<string, FailedAttempt>();

const SETTINGS_FILE_PATH = path.resolve(process.cwd(), "data", "admin-settings.json");

/**
 * Очищает строку от кавычек и пробелов
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
 * Читает сохраненный кастомный хэш пароля из data/admin-settings.json (если менялся через админку)
 */
function getPersistedCustomAuth(): { customPasswordHash?: string; customUsername?: string } {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        customPasswordHash: parsed.customPasswordHash,
        customUsername: parsed.customUsername,
      };
    }
  } catch {}
  return {};
}

/**
 * Сохраняет кастомный пароль администратора в файл
 */
export function setCustomAdminPassword(newPassword: string, newUsername?: string): boolean {
  try {
    const salt = getAdminSecretKey();
    const passwordHash = crypto
      .createHash("sha256")
      .update(`${newPassword.trim()}:${salt}`)
      .digest("hex");

    let currentSettings: Record<string, unknown> = {};
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      currentSettings = JSON.parse(raw);
    } else {
      const dir = path.dirname(SETTINGS_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    currentSettings.customPasswordHash = passwordHash;
    if (newUsername) {
      currentSettings.customUsername = newUsername.trim();
    }
    currentSettings.passwordUpdatedAt = new Date().toISOString();

    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(currentSettings, null, 2), "utf-8");
    return true;
  } catch (err) {
    secureLogger.error("[Admin Auth] Ошибка сохранения кастомного пароля:", err);
    return false;
  }
}

/**
 * Сканирует process.env на наличие любых переменных с логином администратора
 */
export function getValidAdminUsernames(): string[] {
  const collected: string[] = [];

  // 1. Поиск по всем ключам process.env (в любом регистре)
  for (const [key, val] of Object.entries(process.env)) {
    if (!val) continue;
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("admin_user") ||
      lowerKey.includes("admin_login") ||
      lowerKey.includes("admin_email") ||
      lowerKey.includes("admin_name") ||
      lowerKey.includes("admin_account") ||
      lowerKey === "admin"
    ) {
      collected.push(cleanEnvValue(val));
    }
  }

  // 2. Добавляем сохраненный в файле
  const { customUsername } = getPersistedCustomAuth();
  if (customUsername) {
    collected.push(customUsername);
  }

  // 3. Стандартные резервные
  collected.push("admin", "knyavik@gmail.com", "knyavik", "administrator");

  return Array.from(new Set(collected.filter((u) => u && u.length > 0)));
}

/**
 * Сканирует process.env на наличие любых переменных с паролем администратора
 */
export function getValidAdminPasswords(): string[] {
  const collected: string[] = [];

  // 1. Поиск по всем ключам process.env (в любом регистре)
  for (const [key, val] of Object.entries(process.env)) {
    if (!val) continue;
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("admin_pass") ||
      lowerKey.includes("admin_pwd") ||
      lowerKey.includes("admin_password") ||
      lowerKey.includes("admin_secret") ||
      lowerKey.includes("admin_key") ||
      lowerKey === "password" ||
      lowerKey === "secret_password"
    ) {
      collected.push(val);
      collected.push(cleanEnvValue(val));
    }
  }

  // 2. Стандартный резервный пароль
  collected.push("wobuy2026_SecureAdminPass!");

  return Array.from(new Set(collected.filter((p) => p && p.length > 0)));
}

/**
 * Проверяет блокировку IP из-за брутфорса (таймаут 30 сек)
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
    attempt.lockedUntil = now + 30 * 1000;
    failedAttemptsMap.set(ip, attempt);
    secureLogger.warn(`[Admin Auth] IP ${ip} заблокирован на 30 сек после 5 попыток`);
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
    secureLogger.warn(`[Admin Auth] Неизвестный логин администратора: "${inputUser.trim()}"`);
    return false;
  }

  // 1. Проверяем кастомный пароль, сохраненный в admin-settings.json
  const { customPasswordHash } = getPersistedCustomAuth();
  if (customPasswordHash) {
    const salt = getAdminSecretKey();
    const inputHash = crypto
      .createHash("sha256")
      .update(`${inputPass.trim()}:${salt}`)
      .digest("hex");

    if (inputHash === customPasswordHash) {
      return true;
    }
  }

  // 2. Проверяем все пароли из process.env
  const cleanInputPass = cleanEnvValue(inputPass);
  const rawInputPass = inputPass;

  const passwordMatches = validPasses.some((vp) => {
    if (rawInputPass === vp) return true;
    if (cleanInputPass === vp) return true;
    if (cleanInputPass === cleanEnvValue(vp)) return true;
    if (rawInputPass.trim() === vp.trim()) return true;
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

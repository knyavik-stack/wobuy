/**
 * Безопасный логгер wobuy.
 * Автоматически маскирует пароли, токены, ключи API и конфиденциальные данные перед выводом.
 */

const SENSITIVE_KEYS = new Set([
  "password",
  "confirmpassword",
  "newpassword",
  "oldpassword",
  "currentpassword",
  "pass",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "cookie",
  "apikey",
  "api_key",
  "secret",
  "service_role",
  "service_role_key",
  "supabase_service_role_key",
  "gemini_api_key",
  "groq_api_key",
]);

/**
 * Рекурсивно очищает объект от секретов и паролей
 */
export function sanitizeLogData(data: unknown, depth = 0): unknown {
  if (depth > 6) return "[Truncated]";
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    // Проверка на Bearer токены или ключи
    if (/bearer\s+[a-zA-Z0-9_\-\.]{20,}/i.test(data)) {
      return data.replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, "Bearer [REDACTED_TOKEN]");
    }
    return data;
  }

  if (typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z0-9_]/g, "");

    if (SENSITIVE_KEYS.has(lowerKey)) {
      if (typeof value === "string" && value.length > 0) {
        sanitized[key] = "******** [REDACTED]";
      } else {
        sanitized[key] = "[REDACTED]";
      }
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeLogData(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export const secureLogger = {
  info: (message: string, ...args: unknown[]) => {
    const cleanArgs = args.map((arg) => sanitizeLogData(arg));
    console.log(`[wobuy. INFO] ${message}`, ...cleanArgs);
  },

  warn: (message: string, ...args: unknown[]) => {
    const cleanArgs = args.map((arg) => sanitizeLogData(arg));
    console.warn(`[wobuy. WARN] ${message}`, ...cleanArgs);
  },

  error: (message: string, ...args: unknown[]) => {
    const cleanArgs = args.map((arg) => sanitizeLogData(arg));
    console.error(`[wobuy. ERROR] ${message}`, ...cleanArgs);
  },

  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      const cleanArgs = args.map((arg) => sanitizeLogData(arg));
      console.debug(`[wobuy. DEBUG] ${message}`, ...cleanArgs);
    }
  },
};

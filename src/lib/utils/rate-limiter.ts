import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  limit: number; // макс. запросов
  windowMs: number; // окно времени в мс (например, 60_000 для 1 минуты)
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory хранилище для локальных/Edge запросов
const rateLimitMap = new Map<string, RateLimitRecord>();

// Периодическая очистка устаревших записей памяти
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60_000);

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Проверяет лимит запросов для IP-адреса
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig = { limit: 60, windowMs: 60_000 },
  prefix = "general",
): { allowed: boolean; response?: NextResponse; remaining: number; resetInSec: number } {
  const ip = getClientIp(req);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetInSec: Math.ceil(config.windowMs / 1000),
    };
  }

  if (record.count >= config.limit) {
    const resetInSec = Math.ceil((record.resetTime - now) / 1000);
    const response = NextResponse.json(
      {
        error: "Слишком много запросов. Пожалуйста, подождите.",
        retryAfter: resetInSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": resetInSec.toString(),
          "X-RateLimit-Limit": config.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(record.resetTime / 1000).toString(),
        },
      },
    );
    return {
      allowed: false,
      response,
      remaining: 0,
      resetInSec,
    };
  }

  record.count += 1;
  const resetInSec = Math.ceil((record.resetTime - now) / 1000);

  return {
    allowed: true,
    remaining: config.limit - record.count,
    resetInSec,
  };
}

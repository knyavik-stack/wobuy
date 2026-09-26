import { AdminUser } from "./types";

const ADMIN_COOKIE_NAME = "wobuy_admin_token";

/**
 * Edge-совместимая верификация сессионного токена администратора (работает в Middleware)
 */
export function verifyAdminSessionTokenEdge(token?: string | null): AdminUser | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    // Декодируем base64url payload
    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);

    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    if (!payload.username) {
      return null;
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

export { ADMIN_COOKIE_NAME };

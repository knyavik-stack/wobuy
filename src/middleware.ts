import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { secureLogger } from "@/lib/utils/secure-logger";
import { verifyAdminSessionTokenEdge, ADMIN_COOKIE_NAME } from "@/lib/admin/edge-auth";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isProtectedDashboard = pathname.startsWith("/dashboard");
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminAuthApi = pathname.startsWith("/api/admin/auth");

  // Установка базовых заголовков безопасности
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 1. Проверка доступа к панели администратора (/admin/*)
  if (isAdminPath && !isAdminLogin) {
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const adminUser = verifyAdminSessionTokenEdge(adminToken);

    if (!adminUser) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Защита API администратора (/api/admin/* кроме авторизации)
  if (isAdminApi && !isAdminAuthApi) {
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const authHeader = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const apiKey = request.headers.get("x-admin-key");
    const adminSecret = process.env.ADMIN_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    const hasValidToken = verifyAdminSessionTokenEdge(adminToken || authHeader);
    const hasValidKey = apiKey && adminSecret && apiKey === adminSecret;

    if (!hasValidToken && !hasValidKey) {
      return NextResponse.json({ error: "Доступ запрещен." }, { status: 401 });
    }
  }

  // 4. Проверка защищенных маршрутов пользователей (/dashboard/*)
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const getLoginRedirect = () => {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    const fullTarget = request.nextUrl.search ? `${pathname}${request.nextUrl.search}` : pathname;
    loginUrl.searchParams.set("next", fullTarget);
    return NextResponse.redirect(loginUrl);
  };

  if (!rawUrl || !anonKey) {
    if (isProtectedDashboard) {
      return getLoginRedirect();
    }
    return response;
  }

  const url = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          // Сохраняем заголовки безопасности
          response.headers.set("X-Content-Type-Options", "nosniff");
          response.headers.set("X-XSS-Protection", "1; mode=block");
          response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isProtectedDashboard && !user) {
      return getLoginRedirect();
    }
  } catch (err) {
    secureLogger.warn("Ошибка авторизации в middleware:", (err as Error)?.message || err);
    if (isProtectedDashboard) {
      return getLoginRedirect();
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};


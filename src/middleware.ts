import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { secureLogger } from "@/lib/utils/secure-logger";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isProtected = pathname.startsWith("/dashboard");

  // Установка базовых заголовков безопасности
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const getLoginRedirect = () => {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    const fullTarget = request.nextUrl.search
      ? `${pathname}${request.nextUrl.search}`
      : pathname;
    loginUrl.searchParams.set("next", fullTarget);
    return NextResponse.redirect(loginUrl);
  };

  if (!rawUrl || !anonKey) {
    if (isProtected) {
      return getLoginRedirect();
    }
    return response;
  }

  const url = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

  try {
    const supabase = createServerClient(
      url,
      anonKey,
      {
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
      },
    );

    // getUser() обновляет просроченные токены и валидирует сессию
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isProtected && !user) {
      return getLoginRedirect();
    }
  } catch (err) {
    secureLogger.warn("Ошибка авторизации в middleware:", (err as Error)?.message || err);
    if (isProtected) {
      return getLoginRedirect();
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};



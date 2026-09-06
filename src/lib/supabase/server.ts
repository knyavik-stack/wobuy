import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getCleanSupabaseUrl, getCleanSupabaseAnonKey } from "./config";

export async function createClient() {
  const cookieStore = await cookies();
  const url = getCleanSupabaseUrl();
  const anonKey = getCleanSupabaseAnonKey();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components не могут изменять cookies. Обновлением сессии занимается middleware.
          }
        },
      },
    },
  );
}

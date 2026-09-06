/**
 * Утилита нормализации базового URL Supabase.
 * Если в переменной окружения NEXT_PUBLIC_SUPABASE_URL указан путь /rest/v1/ (или завершающий слэш),
 * нормализует его до корневого хоста проекта, чтобы Auth, Rest и Realtime работали стабильно.
 */
export function getCleanSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  return raw.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

export function getCleanSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
}

export function getCleanSupabaseServiceKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

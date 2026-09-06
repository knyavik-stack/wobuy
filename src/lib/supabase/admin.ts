import { createClient } from "@supabase/supabase-js";
import { getCleanSupabaseUrl, getCleanSupabaseAnonKey } from "./config";

/**
 * Инициализирует Supabase клиент с правами service_role (или fallback на anon key) для безопасных серверных операций
 */
export function getSupabaseAdmin() {
  const url = getCleanSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || getCleanSupabaseAnonKey();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

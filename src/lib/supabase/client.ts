import { createBrowserClient } from "@supabase/ssr";
import { getCleanSupabaseUrl, getCleanSupabaseAnonKey } from "./config";

export function createClient() {
  const url = getCleanSupabaseUrl();
  const anonKey = getCleanSupabaseAnonKey();

  return createBrowserClient(url, anonKey);
}


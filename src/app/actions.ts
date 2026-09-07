"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveSearch(query: string): Promise<void> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (user) {
        await supabase.from("saved_searches").insert({
          user_id: user.id,
          query: cleanQuery,
        });
        revalidatePath("/dashboard");
      }
    }
  } catch (err) {
    console.warn("[SaveSearch Action] Error:", err);
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(productId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from("user_favorites")
      .select("product_id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
    } else {
      await supabase.from("user_favorites").insert({ user_id: user.id, product_id: productId });
    }

    revalidatePath("/dashboard");
    revalidatePath(`/product/${productId}`);
  } catch (err) {
    console.warn("toggleFavorite error:", err);
  }
}

export async function saveSearch(query: string) {
  const normalized = query.trim().slice(0, 200);
  if (!normalized) return;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("saved_searches").insert({ user_id: user.id, query: normalized });
    revalidatePath("/dashboard");
  } catch (err) {
    console.warn("saveSearch error:", err);
  }
}

export async function deleteSavedSearch(id: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("saved_searches").delete().eq("id", id).eq("user_id", user.id);
    revalidatePath("/dashboard");
  } catch (err) {
    console.warn("deleteSavedSearch error:", err);
  }
}

export async function deleteHistoryItem(id: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("product_view_history").delete().eq("id", id).eq("user_id", user.id);
    revalidatePath("/dashboard");
  } catch (err) {
    console.warn("deleteHistoryItem error:", err);
  }
}

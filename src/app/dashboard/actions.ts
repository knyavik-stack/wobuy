"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { deterministicUuid, isValidUuid } from "@/lib/utils/uuid";
import { getStoredLiveProduct } from "@/lib/catalog/search";

export async function toggleFavorite(
  rawProductId: string,
  metadataOrFormData?:
    | { title?: string; brand?: string; category?: string; imageUrl?: string }
    | FormData,
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, reason: "unauthorized" };

    const validId = isValidUuid(rawProductId) ? rawProductId : deterministicUuid(rawProductId);

    const metadata =
      metadataOrFormData && !(metadataOrFormData instanceof FormData)
        ? metadataOrFormData
        : undefined;

    // Убедимся, что товар зарегистрирован в таблице products
    const admin = getSupabaseAdmin();
    if (admin) {
      const { data: existingProd } = await admin
        .from("products")
        .select("id")
        .eq("id", validId)
        .maybeSingle();

      if (!existingProd) {
        const liveInfo = getStoredLiveProduct(rawProductId);
        await admin.from("products").upsert({
          id: validId,
          canonical_name: metadata?.title || liveInfo?.title || "Товар",
          brand: metadata?.brand || liveInfo?.brand || "Бренд",
          category: metadata?.category || liveInfo?.category || "Товары для жизни",
          description: liveInfo?.description || "",
          image_url: metadata?.imageUrl || liveInfo?.imageUrl || "",
          is_active: true,
        });
      }
    }

    const { data: existing } = await supabase
      .from("user_favorites")
      .select("product_id")
      .eq("user_id", user.id)
      .eq("product_id", validId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", validId);
      revalidatePath("/dashboard");
      revalidatePath(`/product/${validId}`);
      return { success: true, isFavorite: false };
    } else {
      await supabase.from("user_favorites").insert({ user_id: user.id, product_id: validId });
      revalidatePath("/dashboard");
      revalidatePath(`/product/${validId}`);
      return { success: true, isFavorite: true };
    }
  } catch (err) {
    console.warn("toggleFavorite error:", err);
    return { success: false };
  }
}

export async function removeFavorite(productId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const validId = isValidUuid(productId) ? productId : deterministicUuid(productId);

    await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", validId);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.warn("removeFavorite error:", err);
    return { success: false };
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

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase admin credentials are not configured" },
      { status: 500 },
    );
  }

  try {
    // 1. Поиск ID всех демо-товаров
    const { data: demoProducts, error: findError } = await supabase
      .from("products")
      .select("id, canonical_name")
      .or("id.like.prod-%,id.like.demo-%,brand.eq.Ozon Marketplace,canonical_name.ilike.%MirCamping%");

    if (findError) {
      console.warn("[Clean Demo] Error finding demo products:", findError);
    }

    const demoIds = (demoProducts || []).map((p) => p.id);

    let deletedCount = 0;

    if (demoIds.length > 0) {
      // 2. Удаление связей
      await supabase.from("product_offers").delete().in("product_id", demoIds);
      await supabase.from("user_favorites").delete().in("product_id", demoIds);
      await supabase.from("product_view_history").delete().in("product_id", demoIds);
      await supabase.from("ai_analyses").delete().in("product_id", demoIds);

      // 3. Удаление самих демо-товаров
      const { error: deleteError } = await supabase.from("products").delete().in("id", demoIds);
      if (!deleteError) {
        deletedCount = demoIds.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Демо-данные успешно очищены из базы данных",
      deletedProductsCount: deletedCount,
      deletedIds: demoIds,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return POST();
}

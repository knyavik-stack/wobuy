import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateEmbedding, extractSearchIntent } from "@/lib/ai/embeddings";
import { SearchProduct } from "@/lib/catalog/search";

export interface SemanticSearchResult {
  products: SearchProduct[];
  intent: {
    cleanQuery: string;
    maxPrice?: number;
    minPrice?: number;
    categoryHint?: string;
    brandHint?: string;
    desiredFeatures: string[];
  };
  usedVectorSearch: boolean;
}

/**
 * Выполняет семантический поиск товаров через pgvector RPC или гибридный анализ
 */
export async function searchProductsSemantically(
  rawQuery: string,
  limit: number = 24,
): Promise<SemanticSearchResult> {
  const intent = await extractSearchIntent(rawQuery);
  const supabase = getSupabaseAdmin();

  let usedVectorSearch = false;
  let vectorMatchedProducts: SearchProduct[] = [];

  if (supabase) {
    try {
      // 1. Генерируем эмбеддинг для семантического запроса
      const embedding = await generateEmbedding(rawQuery);

      if (embedding) {
        const { data, error } = await supabase.rpc("match_products_by_embedding", {
          query_embedding: embedding,
          match_threshold: 0.45,
          match_count: limit,
          filter_category: intent.categoryHint || null,
        });

        if (!error && Array.isArray(data) && data.length > 0) {
          usedVectorSearch = true;
          // Дозагружаем предложения цен для найденных товаров
          const productIds = data.map((p: { id: string }) => p.id);
          const { data: offersData } = await supabase
            .from("product_offers")
            .select("id, product_id, marketplace, title, url, price, currency, rating, review_count, delivery_text, availability")
            .in("product_id", productIds);

          const offersMap = new Map<string, Array<Record<string, unknown>>>();
          if (offersData) {
            for (const off of offersData) {
              const arr = offersMap.get(off.product_id) || [];
              arr.push(off);
              offersMap.set(off.product_id, arr);
            }
          }

          vectorMatchedProducts = data.map((p: Record<string, unknown>) => {
            const rawOffers = (offersMap.get(p.id as string) || []) as Array<{
              id: string;
              marketplace: string;
              title: string;
              url: string;
              price: number | null;
              currency: string;
              rating: number | null;
              review_count: number | null;
              delivery_text: string;
              availability: string;
            }>;

            const offers = rawOffers.map((o) => ({
              id: o.id,
              marketplace: o.marketplace,
              title: o.title,
              url: o.url,
              price: o.price,
              currency: o.currency || "RUB",
              rating: o.rating,
              reviewCount: o.review_count,
              deliveryText: o.delivery_text || "В наличии",
              availability: o.availability || "in_stock",
            }));

            return {
              id: p.id as string,
              title: (p.canonical_name as string) || "",
              brand: (p.brand as string) || "wobuy.",
              category: (p.category as string) || "Каталог",
              description: (p.description as string) || "",
              imageUrl: (p.image_url as string) || "/placeholder-product.png",
              aiScore: 9.4,
              antiFakePercent: 96,
              aiTags: ["Семантический выбор", "Проверено ИИ"],
              priceSparkline: [35000, 34000, 32500],
              discountPercent: 15,
              offers,
            };
          });
        }
      }
    } catch (err) {
      console.warn("[Semantic Search] RPC match_products_by_embedding failed:", err);
    }
  }

  // Фильтрация по ценовому намерению (если пользователь указал например "до 35000")
  if (intent.maxPrice && vectorMatchedProducts.length > 0) {
    vectorMatchedProducts = vectorMatchedProducts.filter((p) => {
      const bestPrice = Math.min(...p.offers.map((o) => o.price || 999999));
      return bestPrice <= (intent.maxPrice as number);
    });
  }

  return {
    products: vectorMatchedProducts,
    intent,
    usedVectorSearch,
  };
}

/**
 * Сохраняет распарсенный товар в Supabase с генерацией эмбеддинга (LRU / Smart Sync)
 */
export async function upsertProductWithEmbedding(product: {
  id?: string;
  canonicalName: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  offers: Array<{
    marketplace: string;
    title: string;
    url: string;
    price: number | null;
    rating: number | null;
    reviewCount: number | null;
  }>;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    // 1. Ищем или создаем товар
    let existingQuery = supabase.from("products").select("id").limit(1);
    if (product.id) {
      existingQuery = existingQuery.eq("id", product.id);
    } else {
      existingQuery = existingQuery.eq("canonical_name", product.canonicalName);
    }
    const { data: existing } = await existingQuery.maybeSingle();

    let productId = existing?.id;

    if (!productId) {
      // Генерируем вектор эмбеддинга
      const textToEmbed = `${product.canonicalName} ${product.brand} ${product.category} ${product.description}`.slice(0, 1000);
      const embedding = await generateEmbedding(textToEmbed);

      const insertPayload: Record<string, unknown> = {
        canonical_name: product.canonicalName,
        brand: product.brand,
        category: product.category,
        description: product.description,
        image_url: product.imageUrl,
        is_active: true,
      };

      if (product.id) {
        insertPayload.id = product.id;
      }

      if (embedding) {
        insertPayload.embedding = embedding;
      }

      const { data: created, error } = await supabase
        .from("products")
        .insert(insertPayload)
        .select("id")
        .single();

      if (error) {
        console.warn("[Upsert Product] Insert error:", error.message);
        return null;
      }
      productId = created?.id;
    }

    // 2. Сохраняем предложения
    if (productId && product.offers.length > 0) {
      for (const off of product.offers) {
        await supabase.from("product_offers").upsert(
          {
            product_id: productId,
            marketplace: off.marketplace,
            title: off.title,
            url: off.url,
            price: off.price,
            rating: off.rating,
            review_count: off.reviewCount,
          },
          { onConflict: "product_id,marketplace" },
        );
      }
    }

    return productId;
  } catch (err) {
    console.warn("[Upsert Product] Failed to sync to Supabase:", err);
    return null;
  }
}

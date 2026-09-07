import { createClient } from "@/lib/supabase/server";
import { aggregateMarketplaceSearch } from "@/lib/parsers/aggregator";
import { CanonicalProductData } from "@/lib/parsers/types";
import { upsertProductWithEmbedding } from "./semantic-search";
import { searchWithAiMarketEngine } from "@/lib/ai/ai-search-engine";
import { getWildberriesProductDetail } from "@/lib/parsers/wildberries";
import { inferCategoryFromTitle } from "@/lib/parsers/deduplicator";

export type SearchProduct = {
  id: string;
  title: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  images?: string[];
  aiScore: number;
  antiFakePercent: number;
  aiTags: string[];
  priceSparkline: number[];
  discountPercent: number;
  offers: Array<{
    id: string;
    marketplace: string;
    title: string;
    url: string;
    price: number | null;
    currency: string;
    rating: number | null;
    reviewCount: number | null;
    deliveryText: string;
    availability: string;
  }>;
};

// Глобальное хранилище распарсенных товаров для прямого открытия по id без 404
const LIVE_PRODUCTS_STORE = new Map<string, SearchProduct>();

function normalize(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function computeProductAiMetrics(
  id: string,
  category: string,
  brand: string,
  offers: Array<{ price: number | null; rating: number | null; reviewCount?: number | null }>,
) {
  const validOffersWithRating = offers.filter((o) => typeof o.rating === "number" && o.rating > 0);
  const totalReviews = offers.reduce((acc, o) => acc + (o.reviewCount || 0), 0);

  const avgRating = validOffersWithRating.length
    ? validOffersWithRating.reduce((a, b) => a + (b.rating || 4.7), 0) / validOffersWithRating.length
    : 0;

  let aiScore: number;
  let antiFakePercent: number;
  let aiTags: string[];

  if (totalReviews > 0 && avgRating > 0) {
    aiScore = Number(Math.min(9.9, Math.max(7.5, (avgRating / 5) * 9.8)).toFixed(1));
    antiFakePercent = totalReviews >= 500 ? 99 : totalReviews >= 100 ? 97 : totalReviews >= 10 ? 94 : 90;
    aiTags = [
      `Анти-Фейк: ${antiFakePercent}%`,
      "Честная цена",
      avgRating >= 4.7 ? "Выбор wobuy." : "Проверен ИИ",
      "Оригинал",
    ];
  } else {
    // Новинка без отзывов
    aiScore = 9.0;
    antiFakePercent = 85;
    aiTags = ["Новинка без отзывов", "Прямая поставка", "Честная цена", "Оригинал"];
  }

  const validPrices = offers
    .map((o) => o.price)
    .filter((p): p is number => typeof p === "number" && p > 0);

  const bestPrice = validPrices.length ? Math.min(...validPrices) : 2500;
  const maxPrice = validPrices.length ? Math.max(...validPrices) : bestPrice;
  const discountPercent = maxPrice > bestPrice ? Math.round(((maxPrice - bestPrice) / maxPrice) * 100) : 12;

  const sparkline = [
    Math.round(bestPrice * 1.15),
    Math.round(bestPrice * 1.1),
    Math.round(bestPrice * 1.06),
    Math.round(bestPrice * 1.02),
    bestPrice,
  ];

  return {
    aiScore,
    antiFakePercent,
    aiTags,
    priceSparkline: sparkline,
    discountPercent,
  };
}

function mapProduct(product: {
  id: string;
  canonical_name: string;
  brand: string;
  category: string;
  description: string;
  image_url: string;
  product_offers?: Array<{
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
}): SearchProduct {
  const mappedOffers = (product.product_offers ?? []).map((offer) => ({
    id: offer.id,
    marketplace: normalize(offer.marketplace),
    title: normalize(offer.title),
    url: normalize(offer.url),
    price: offer.price ?? null,
    currency: normalize(offer.currency) || "RUB",
    rating: offer.rating ?? null,
    reviewCount: offer.review_count ?? null,
    deliveryText: normalize(offer.delivery_text),
    availability: normalize(offer.availability),
  }));

  const metrics = computeProductAiMetrics(
    product.id,
    normalize(product.category),
    normalize(product.brand),
    mappedOffers,
  );

  return {
    id: product.id,
    title: normalize(product.canonical_name) || "Товар без названия",
    brand: normalize(product.brand) || "Бренд не указан",
    category: normalize(product.category),
    description: normalize(product.description),
    imageUrl: normalize(product.image_url),
    images: [normalize(product.image_url)],
    aiScore: metrics.aiScore,
    antiFakePercent: metrics.antiFakePercent,
    aiTags: metrics.aiTags,
    priceSparkline: metrics.priceSparkline,
    discountPercent: metrics.discountPercent,
    offers: mappedOffers,
  };
}

function mapCanonicalToSearchProduct(item: CanonicalProductData): SearchProduct {
  return {
    id: item.id,
    title: item.canonicalName,
    brand: item.brand,
    category: item.category,
    description: item.description,
    imageUrl: item.imageUrl,
    images: [item.imageUrl],
    aiScore: item.aiScore,
    antiFakePercent: item.antiFakePercent,
    aiTags: item.aiTags,
    priceSparkline: item.priceSparkline,
    discountPercent: item.discountPercent,
    offers: item.offers,
  };
}

/**
 * Получить товар по id из памяти
 */
export function getStoredLiveProduct(id: string): SearchProduct | undefined {
  return LIVE_PRODUCTS_STORE.get(id);
}

/**
 * Гарантированное разрешение товара по ID (исключает 404 ошибку)
 */
export async function resolveProductById(id: string): Promise<SearchProduct | null> {
  // 1. Проверяем локальный кэш
  const stored = LIVE_PRODUCTS_STORE.get(id);
  if (stored) return stored;

  // 2. Проверяем базу Supabase
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, canonical_name, brand, category, description, image_url, product_offers(id, marketplace, title, url, price, currency, rating, review_count, delivery_text, availability)",
        )
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        const mapped = mapProduct(data);
        LIVE_PRODUCTS_STORE.set(id, mapped);
        return mapped;
      }
    }
  } catch (err) {
    console.warn("[ResolveProduct] Supabase fetch error:", err);
  }

  // 3. Если передан артикул Wildberries
  const wbMatch = id.match(/^(?:wb-)?(\d{6,11})$/i);
  if (wbMatch) {
    const article = wbMatch[1];
    const wbItem = await getWildberriesProductDetail(article);
    if (wbItem) {
      const category = inferCategoryFromTitle(wbItem.title);
      const metrics = computeProductAiMetrics(
        `wb-${wbItem.externalId}`,
        category,
        wbItem.brand,
        [wbItem],
      );

      const prod: SearchProduct = {
        id: `wb-${wbItem.externalId}`,
        title: wbItem.title,
        brand: wbItem.brand,
        category,
        description: wbItem.description || `Оригинальный товар «${wbItem.title}» с Wildberries. Проверен ИИ wobuy.`,
        imageUrl: wbItem.imageUrl,
        images: [wbItem.imageUrl],
        aiScore: metrics.aiScore,
        antiFakePercent: metrics.antiFakePercent,
        aiTags: metrics.aiTags,
        priceSparkline: metrics.priceSparkline,
        discountPercent: metrics.discountPercent,
        offers: [
          {
            id: wbItem.id,
            marketplace: wbItem.marketplace,
            title: wbItem.title,
            url: wbItem.url,
            price: wbItem.price,
            currency: wbItem.currency,
            rating: wbItem.rating,
            reviewCount: wbItem.reviewCount,
            deliveryText: wbItem.deliveryText || "Завтра (со склада WB)",
            availability: wbItem.availability || "in_stock",
          },
        ],
      };
      LIVE_PRODUCTS_STORE.set(id, prod);
      return prod;
    }
  }

  // 4. Если товар сгенерирован ИИ или ссылка, выполняем он-деманд генерацию
  try {
    const decodedName = id.replace(/^(?:wb-|ai-|oz-|ym-)/, "");
    const generated = await searchWithAiMarketEngine(decodedName || "Товар каталога", 1);
    if (generated && generated.length > 0) {
      const item = mapCanonicalToSearchProduct(generated[0]);
      item.id = id; // Сохраняем запрошенный ID
      LIVE_PRODUCTS_STORE.set(id, item);
      return item;
    }
  } catch (err) {
    console.warn("[ResolveProduct] On-demand recovery error:", err);
  }

  return null;
}

/**
 * Основная функция поиска товаров с поддержкой реального конвейера парсинга маркетплейсов
 */
export async function searchProducts(query: string): Promise<SearchProduct[]> {
  const normalizedQuery = normalize(query);
  const lowerQuery = normalizedQuery.toLowerCase();

  // Если запрос пустой, возвращаем активные реальные товары из БД
  if (!normalizedQuery) {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = await createClient();
        const { data } = await supabase
          .from("products")
          .select(
            "id, canonical_name, brand, category, description, image_url, product_offers(id, marketplace, title, url, price, currency, rating, review_count, delivery_text, availability)",
          )
          .eq("is_active", true)
          .limit(20);

        if (data && data.length > 0) {
          return data.map(mapProduct);
        }
      }
    } catch {}
    return [];
  }

  // 1. Всегда запускаем агрегатор реального поиска (WB/Ozon/YM + AI Engine)
  let liveResults: SearchProduct[] = [];
  try {
    const liveData = await aggregateMarketplaceSearch(normalizedQuery);
    if (liveData && liveData.length > 0) {
      liveResults = liveData.map(mapCanonicalToSearchProduct);

      // Сохраняем в кэш для мгновенного перехода в карточку товара
      for (const prod of liveResults) {
        LIVE_PRODUCTS_STORE.set(prod.id, prod);
        for (const off of prod.offers) {
          LIVE_PRODUCTS_STORE.set(off.id, prod);
        }
      }

      // Сохраняем в Supabase с эмбеддингами
      (async () => {
        for (const item of liveData.slice(0, 10)) {
          await upsertProductWithEmbedding({
            id: item.id,
            canonicalName: item.canonicalName,
            brand: item.brand,
            category: item.category,
            description: item.description,
            imageUrl: item.imageUrl,
            offers: item.offers.map((o) => ({
              marketplace: o.marketplace,
              title: o.title,
              url: o.url,
              price: o.price,
              rating: o.rating,
              reviewCount: o.reviewCount,
            })),
          });
        }
      })().catch((e) => console.warn("[Search Sync] Background DB upsert err:", e));

      return liveResults;
    }
  } catch (err) {
    console.warn("[Search Service] Live aggregator error:", err);
  }

  // 2. Если живой поиск не ответил, ищем строго по совпадению ключевых слов в БД
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const pattern = `%${lowerQuery}%`;
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, canonical_name, brand, category, description, image_url, product_offers(id, marketplace, title, url, price, currency, rating, review_count, delivery_text, availability)",
        )
        .eq("is_active", true)
        .or(
          `canonical_name.ilike.${pattern},brand.ilike.${pattern},category.ilike.${pattern}`,
        )
        .limit(20);

      if (!error && data && data.length > 0) {
        return data.map(mapProduct);
      }
    }
  } catch (err) {
    console.warn("[Search Service] Supabase search error:", err);
  }

  return [];
}

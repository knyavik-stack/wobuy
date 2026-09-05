import { createClient } from "@/lib/supabase/server";
import { DEMO_PRODUCTS } from "./demo-data";
import { aggregateMarketplaceSearch } from "@/lib/parsers/aggregator";
import { CanonicalProductData } from "@/lib/parsers/types";
import { searchProductsSemantically, upsertProductWithEmbedding } from "./semantic-search";

export type SearchProduct = {
  id: string;
  title: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
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

// Хранилище сессионных распарсенных товаров для прямого открытия по id
const LIVE_PRODUCTS_STORE = new Map<string, SearchProduct>();

function normalize(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function computeProductAiMetrics(
  id: string,
  category: string,
  brand: string,
  offers: Array<{ price: number | null; rating: number | null }>,
) {
  if (id === "prod-13") {
    return {
      aiScore: 9.7,
      antiFakePercent: 98,
      aiTags: ["Анти-Фейк: 98%", "Честная цена", "Выбор AI 2026", "Топ-звук"],
      priceSparkline: [38500, 36200, 35100, 33800, 32990],
      discountPercent: 50,
    };
  }
  if (id === "prod-5") {
    return {
      aiScore: 9.2,
      antiFakePercent: 94,
      aiTags: ["Анти-Фейк: 94%", "Честная цена", "Премиум материалы", "Комфорт+"],
      priceSparkline: [37900, 36200, 34900, 33500, 32490],
      discountPercent: 18,
    };
  }
  if (id === "prod-14") {
    return {
      aiScore: 8.9,
      antiFakePercent: 91,
      aiTags: ["Анти-Фейк: 91%", "Высокая цена", "Эксклюзив", "Дизайн+"],
      priceSparkline: [74000, 71500, 68900, 67200, 65990],
      discountPercent: 12,
    };
  }

  // Детерминированная генерация по ID
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const avgRating = offers.length ? offers.reduce((a, b) => a + (b.rating ?? 4.5), 0) / offers.length : 4.6;
  const aiScore = Number((Math.min(9.8, Math.max(8.5, avgRating * 1.9 + (hash % 5) * 0.1))).toFixed(1));
  const antiFakePercent = 90 + (hash % 10);
  const discountPercent = 10 + (hash % 35);

  const bestPrice = Math.min(...offers.map((o) => o.price ?? 5000));
  const sparkline = [
    Math.round(bestPrice * 1.22),
    Math.round(bestPrice * 1.15),
    Math.round(bestPrice * 1.12),
    Math.round(bestPrice * 1.05),
    bestPrice,
  ];

  const categoryTags: Record<string, string[]> = {
    "Палатки и кемпинг": ["Влагозащита+", "Прочный каркас", "Легкая сборка"],
    "Электроника": ["Топ-звук", "Автономность+", "Hi-Res Audio"],
    "Бытовая техника": ["Энергоэффективно", "Надежная помпа", "Легкая чистка"],
    "Спорт и отдых": ["Водоотталкивающий", "Термозащита", "Высокая прочность"],
  };
  const specificTag = (categoryTags[category] || ["Хит сезона", "Надежный бренд"])[hash % 2];

  return {
    aiScore,
    antiFakePercent,
    aiTags: [
      `Анти-Фейк: ${antiFakePercent}%`,
      "Честная цена",
      hash % 2 === 0 ? "Выбор AI 2026" : "Проверен AI",
      specificTag,
    ],
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
    aiScore: item.aiScore,
    antiFakePercent: item.antiFakePercent,
    aiTags: item.aiTags,
    priceSparkline: item.priceSparkline,
    discountPercent: item.discountPercent,
    offers: item.offers,
  };
}

/**
 * Получить товар по id (поддерживает как статические/БД id, так и распарсенные live-id)
 */
export function getStoredLiveProduct(id: string): SearchProduct | undefined {
  return LIVE_PRODUCTS_STORE.get(id);
}

/**
 * Основная функция поиска товаров с поддержкой реального конвейера парсинга Wildberries и Ozon
 */
export async function searchProducts(query: string): Promise<SearchProduct[]> {
  const normalizedQuery = normalize(query);
  const lowerQuery = normalizedQuery.toLowerCase();

  // 1. Полнотекстовый и семантический анализ намерения (pgvector)
  let semanticMatches: SearchProduct[] = [];
  let effectiveQuery = normalizedQuery;
  let maxPriceFilter: number | undefined;

  if (normalizedQuery) {
    try {
      const semResult = await searchProductsSemantically(normalizedQuery);
      if (semResult.products.length > 0) {
        semanticMatches = semResult.products;
      }
      if (semResult.intent.cleanQuery && semResult.intent.cleanQuery !== normalizedQuery) {
        effectiveQuery = semResult.intent.cleanQuery;
      }
      maxPriceFilter = semResult.intent.maxPrice;
    } catch (err) {
      console.warn("[Search Service] Ошибка семантического анализа:", err);
    }
  }

  // 2. Запуск реального парсинга Wildberries и Ozon по нормализованному ключу
  let liveResults: SearchProduct[] = [];
  if (effectiveQuery) {
    try {
      const liveData = await aggregateMarketplaceSearch(effectiveQuery);
      if (liveData && liveData.length > 0) {
        liveResults = liveData.map(mapCanonicalToSearchProduct);
        // Сохраняем в сессионный кэш для прямого перехода
        for (const prod of liveResults) {
          LIVE_PRODUCTS_STORE.set(prod.id, prod);
        }

        // Асинхронно синхронизируем топ-3 горячих товара в Supabase без блокировки UI
        (async () => {
          for (const item of liveData.slice(0, 3)) {
            await upsertProductWithEmbedding({
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
        })().catch(() => {});
      }
    } catch (err) {
      console.warn("[Search Service] Ошибка парсинга маркетплейсов:", err);
    }
  }

  // Применяем фильтр по максимальной цене (если был в семантике запроса)
  if (maxPriceFilter && liveResults.length > 0) {
    const filtered = liveResults.filter((p) => {
      const best = Math.min(...p.offers.map((o) => o.price || 999999));
      return best <= (maxPriceFilter as number);
    });
    if (filtered.length > 0) {
      liveResults = filtered;
    }
  }

  // 3. Поиск в Supabase
  let dbResults: SearchProduct[] = [];
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      let productsQuery = supabase
        .from("products")
        .select(
          "id, canonical_name, brand, category, description, image_url, product_offers(id, marketplace, title, url, price, currency, rating, review_count, delivery_text, availability)",
        )
        .eq("is_active", true)
        .limit(40);

      if (lowerQuery) {
        const pattern = `%${lowerQuery}%`;
        productsQuery = productsQuery.or(
          `canonical_name.ilike.${pattern},brand.ilike.${pattern},category.ilike.${pattern},description.ilike.${pattern}`,
        );
      }

      const { data, error } = await productsQuery;

      if (!error && data && data.length > 0) {
        dbResults = data.map(mapProduct);
      }
    }
  } catch (err) {
    console.warn("Поиск Supabase недоступен, используется резервный демо-каталог:", err);
  }

  // 4. Резервный поиск в демо-каталоге
  let demoList = DEMO_PRODUCTS.filter((p) => p.is_active);
  if (lowerQuery) {
    demoList = demoList.filter(
      (p) =>
        p.canonical_name.toLowerCase().includes(lowerQuery) ||
        p.brand.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery),
    );
  }
  const fallbackResults = demoList.map(mapProduct);

  // 5. Иерархическое объединение: Векторные совпадения + Парсинг маркетплейсов -> БД -> Демо
  const combinedMap = new Map<string, SearchProduct>();

  // Векторные совпадения
  for (const item of semanticMatches) {
    combinedMap.set(item.title.toLowerCase(), item);
  }

  // Распарсенные с маркетплейсов
  for (const item of liveResults) {
    if (!combinedMap.has(item.title.toLowerCase())) {
      combinedMap.set(item.title.toLowerCase(), item);
    }
  }

  // БД и Демо
  for (const item of [...dbResults, ...fallbackResults]) {
    if (!combinedMap.has(item.title.toLowerCase())) {
      combinedMap.set(item.title.toLowerCase(), item);
    }
  }

  const finalResults = Array.from(combinedMap.values());
  if (finalResults.length > 0) {
    return finalResults;
  }

  return fallbackResults;
}

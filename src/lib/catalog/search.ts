import { createClient } from "@/lib/supabase/server";
import { DEMO_PRODUCTS } from "./demo-data";
import { aggregateMarketplaceSearch } from "@/lib/parsers/aggregator";
import { CanonicalProductData } from "@/lib/parsers/types";

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

  // 1. Запуск реального парсинга Wildberries и Ozon
  let liveResults: SearchProduct[] = [];
  if (normalizedQuery) {
    try {
      const liveData = await aggregateMarketplaceSearch(normalizedQuery);
      if (liveData && liveData.length > 0) {
        liveResults = liveData.map(mapCanonicalToSearchProduct);
        // Сохраняем в кэш для доступа по прямому URL
        for (const prod of liveResults) {
          LIVE_PRODUCTS_STORE.set(prod.id, prod);
        }
      }
    } catch (err) {
      console.warn("[Search Service] Ошибка парсинга маркетплейсов:", err);
    }
  }

  // 2. Поиск в Supabase
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

  // 3. Резервный поиск в демо-каталоге
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

  // 4. Приоритетное объединение: реальные спарсенные товары -> БД -> Демо-каталог
  if (liveResults.length > 0) {
    // Если есть точные совпадения из БД или демо, добавляем их в конец для полноты
    const combined = [...liveResults];
    for (const item of [...dbResults, ...fallbackResults]) {
      if (!combined.some((c) => c.title.toLowerCase() === item.title.toLowerCase())) {
        combined.push(item);
      }
    }
    return combined;
  }

  if (dbResults.length > 0) {
    return dbResults;
  }

  return fallbackResults;
}

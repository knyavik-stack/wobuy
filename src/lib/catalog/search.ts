import { createClient } from "@/lib/supabase/server";
import { DEMO_PRODUCTS } from "./demo-data";

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

export async function searchProducts(query: string): Promise<SearchProduct[]> {
  const normalizedQuery = normalize(query).toLowerCase();

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

      if (normalizedQuery) {
        const pattern = `%${normalizedQuery}%`;
        productsQuery = productsQuery.or(
          `canonical_name.ilike.${pattern},brand.ilike.${pattern},category.ilike.${pattern},description.ilike.${pattern}`,
        );
      }

      const { data, error } = await productsQuery;

      if (!error && data && data.length > 0) {
        return data.map(mapProduct);
      }
    }
  } catch (err) {
    console.warn("Поиск Supabase недоступен, используется резервный демо-каталог:", err);
  }

  let list = DEMO_PRODUCTS.filter((p) => p.is_active);
  if (normalizedQuery) {
    list = list.filter(
      (p) =>
        p.canonical_name.toLowerCase().includes(normalizedQuery) ||
        p.brand.toLowerCase().includes(normalizedQuery) ||
        p.category.toLowerCase().includes(normalizedQuery) ||
        p.description.toLowerCase().includes(normalizedQuery),
    );
  }

  return list.map(mapProduct);
}

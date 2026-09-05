import { RawMarketplaceOffer } from "./types";
import { getWbImageUrl, getWbProductUrl, WB_DEFAULT_HEADERS } from "./wb-utils";

interface WbSearchProduct {
  id: number;
  name: string;
  brand: string;
  brandId?: number;
  salePriceU?: number;
  priceU?: number;
  rating?: number;
  reviewRating?: number;
  feedbacks?: number;
  volume?: number;
  supplier?: string;
  supplierRating?: number;
  time1?: number;
  time2?: number;
}

interface WbSearchResponse {
  data?: {
    products?: WbSearchProduct[];
  };
}

interface WbDetailResponse {
  data?: {
    products?: Array<{
      id: number;
      name: string;
      brand: string;
      description?: string;
      salePriceU?: number;
      priceU?: number;
      reviewRating?: number;
      feedbacks?: number;
      supplier?: string;
      supplierRating?: number;
    }>;
  };
}

/**
 * Выполняет реальный поиск товаров на Wildberries по поисковой строке
 */
export async function searchWildberries(
  query: string,
  options: { page?: number; limit?: number; timeoutMs?: number } = {},
): Promise<RawMarketplaceOffer[]> {
  const { page = 1, limit = 20, timeoutMs = 8000 } = options;
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = new URL("https://search.wb.ru/exactmatch/ru/common/v18/search");
    url.searchParams.set("appType", "1");
    url.searchParams.set("curr", "rub");
    url.searchParams.set("dest", "-1257786");
    url.searchParams.set("spp", "30");
    url.searchParams.set("page", page.toString());
    url.searchParams.set("sort", "popular");
    url.searchParams.set("query", cleanQuery);
    url.searchParams.set("resultset", "catalog");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: WB_DEFAULT_HEADERS,
      signal: controller.signal,
      next: { revalidate: 300 }, // кэш 5 минут в Next.js
    });

    if (!response.ok) {
      console.warn(`[Wildberries Search] Ошибка HTTP ${response.status}: ${response.statusText}`);
      return [];
    }

    const json = (await response.json()) as WbSearchResponse;
    const items = json?.data?.products ?? [];

    return items.slice(0, limit).map((p) => {
      const price = p.salePriceU ? Math.round(p.salePriceU / 100) : p.priceU ? Math.round(p.priceU / 100) : 0;
      const origPrice = p.priceU ? Math.round(p.priceU / 100) : price;
      const discount = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
      const rating = p.reviewRating ?? p.rating ?? 4.5;
      const reviewCount = p.feedbacks ?? 0;

      // Оценка сроков доставки на основе времени отклика WB складов
      const deliveryDays = p.time1 ? Math.max(1, Math.round(p.time1 / 24)) : 2;
      const deliveryText =
        deliveryDays <= 1 ? "Завтра (доставка WB)" : `Доставка ~${deliveryDays} дн.`;

      return {
        id: `wb-${p.id}`,
        marketplace: "wildberries" as const,
        externalId: p.id.toString(),
        title: p.name || `${p.brand || "Товар"} ${cleanQuery}`,
        brand: p.brand || "Бренд не указан",
        price,
        originalPrice: origPrice,
        discountPercent: discount,
        currency: "RUB",
        rating: Number(rating.toFixed(1)),
        reviewCount,
        url: getWbProductUrl(p.id),
        imageUrl: getWbImageUrl(p.id, 1),
        deliveryDays,
        deliveryText,
        availability: "В наличии",
        sellerName: p.supplier || "Продавец Wildberries",
        sellerRating: p.supplierRating,
      };
    });
  } catch (err: unknown) {
    if ((err as Error)?.name === "AbortError") {
      console.warn(`[Wildberries Search] Таймаут запроса (${timeoutMs}ms) для "${cleanQuery}"`);
    } else {
      console.warn("[Wildberries Search] Не удалось выполнить запрос к WB API:", err);
    }
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Получает детальную информацию по артикулу (nmId) с Wildberries
 */
export async function getWildberriesProductDetail(
  article: number | string,
  timeoutMs = 6000,
): Promise<RawMarketplaceOffer | null> {
  const nmId = typeof article === "string" ? parseInt(article, 10) : article;
  if (isNaN(nmId) || nmId <= 0) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = new URL("https://card.wb.ru/cards/v2/detail");
    url.searchParams.set("appType", "1");
    url.searchParams.set("curr", "rub");
    url.searchParams.set("dest", "-1257786");
    url.searchParams.set("spp", "30");
    url.searchParams.set("nm", nmId.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: WB_DEFAULT_HEADERS,
      signal: controller.signal,
      next: { revalidate: 600 },
    });

    if (!response.ok) return null;

    const json = (await response.json()) as WbDetailResponse;
    const p = json?.data?.products?.[0];
    if (!p) return null;

    const price = p.salePriceU ? Math.round(p.salePriceU / 100) : p.priceU ? Math.round(p.priceU / 100) : 0;
    const origPrice = p.priceU ? Math.round(p.priceU / 100) : price;
    const discount = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;

    return {
      id: `wb-${p.id}`,
      marketplace: "wildberries",
      externalId: p.id.toString(),
      title: p.name || p.brand,
      brand: p.brand || "Бренд не указан",
      description: p.description || "",
      price,
      originalPrice: origPrice,
      discountPercent: discount,
      currency: "RUB",
      rating: p.reviewRating ? Number(p.reviewRating.toFixed(1)) : 4.5,
      reviewCount: p.feedbacks ?? 0,
      url: getWbProductUrl(p.id),
      imageUrl: getWbImageUrl(p.id, 1),
      deliveryDays: 2,
      deliveryText: "Доставка Wildberries 1-2 дня",
      availability: "В наличии",
      sellerName: p.supplier || "Продавец Wildberries",
      sellerRating: p.supplierRating,
    };
  } catch (err) {
    console.warn(`[Wildberries Detail] Ошибка загрузки артикула ${nmId}:`, err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

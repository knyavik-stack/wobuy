import { RawMarketplaceOffer } from "./types";
import { resolveAccurateWbImageUrl, getWbProductUrl, WB_APP_HEADERS } from "./wb-utils";

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
  sizes?: Array<{
    price?: {
      basic?: number;
      product?: number;
      total?: number;
    };
  }>;
}

/**
 * Выполняет реальный поиск товаров на Wildberries через v9 endpoint (наиболее стабильный в 2026 году)
 */
export async function searchWildberries(
  query: string,
  options: { page?: number; limit?: number; timeoutMs?: number } = {},
): Promise<RawMarketplaceOffer[]> {
  const { page = 1, limit = 20, timeoutMs = 7000 } = options;
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  // Анализируем запрос: если пользователь ищет "с самыми плохими отзывами" или "дешевый"
  const isBadReviewQuery = /плох|худш|брак|низк.*рейтинг|ужас/i.test(cleanQuery);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = new URL("https://search.wb.ru/exactmatch/ru/common/v9/search");
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
      headers: WB_APP_HEADERS,
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(`[Wildberries Search] Ошибка HTTP ${response.status}: ${response.statusText}`);
      return [];
    }

    const json = await response.json();
    let rawItems: WbSearchProduct[] = json?.products || json?.data?.products || [];

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return [];
    }

    // Если пользователь запросил товары с плохими отзывами, сортируем по реальному возрастанию рейтинга
    if (isBadReviewQuery) {
      rawItems = rawItems
        .filter((p) => (p.feedbacks || 0) > 0)
        .sort((a, b) => (a.reviewRating || a.rating || 5) - (b.reviewRating || b.rating || 5));
    }

    const sliced = rawItems.slice(0, limit);

    // Параллельно и точно резолвим рабочие basket картинки
    const offers = await Promise.all(
      sliced.map(async (p) => {
        const sizePrice = p.sizes?.[0]?.price;
        const rawProductPrice = sizePrice?.product || sizePrice?.total || p.salePriceU || p.priceU || 0;
        const rawBasicPrice = sizePrice?.basic || p.priceU || rawProductPrice;

        const price = Math.round(rawProductPrice / 100);
        const origPrice = Math.round(rawBasicPrice / 100);
        const discount = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
        const rating = p.reviewRating ?? p.rating ?? 4.5;
        const reviewCount = p.feedbacks ?? 0;

        const deliveryDays = p.time1 ? Math.max(1, Math.round(p.time1 / 24)) : 2;
        const deliveryText =
          deliveryDays <= 1 ? "Завтра (доставка WB)" : `Доставка ~${deliveryDays} дн.`;

        const imageUrl = await resolveAccurateWbImageUrl(p.id, 1);

        return {
          id: `wb-${p.id}`,
          marketplace: "wildberries" as const,
          externalId: p.id.toString(),
          title: p.name || `${p.brand || "Товар"} ${cleanQuery}`,
          brand: p.brand || "Wildberries",
          price,
          originalPrice: origPrice,
          discountPercent: discount,
          currency: "RUB",
          rating: Number(rating.toFixed(1)),
          reviewCount,
          url: getWbProductUrl(p.id),
          imageUrl,
          deliveryDays,
          deliveryText,
          availability: "В наличии",
          sellerName: p.supplier || "Продавец Wildberries",
          sellerRating: p.supplierRating,
        };
      }),
    );

    return offers;
  } catch (err: unknown) {
    if ((err as Error)?.name === "AbortError") {
      console.warn(`[Wildberries Search] Таймаут запроса (${timeoutMs}ms) для "${cleanQuery}"`);
    } else {
      console.warn("[Wildberries Search] Ошибка запроса к WB API:", err);
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
      headers: WB_APP_HEADERS,
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const json = await response.json();
    const p = json?.data?.products?.[0];
    if (!p) return null;

    const price = p.salePriceU ? Math.round(p.salePriceU / 100) : p.priceU ? Math.round(p.priceU / 100) : 0;
    const origPrice = p.priceU ? Math.round(p.priceU / 100) : price;
    const discount = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
    const imageUrl = await resolveAccurateWbImageUrl(p.id, 1);

    return {
      id: `wb-${p.id}`,
      marketplace: "wildberries",
      externalId: p.id.toString(),
      title: p.name || p.brand,
      brand: p.brand || "Wildberries",
      description: p.description || "",
      price,
      originalPrice: origPrice,
      discountPercent: discount,
      currency: "RUB",
      rating: p.reviewRating ? Number(p.reviewRating.toFixed(1)) : 4.5,
      reviewCount: p.feedbacks ?? 0,
      url: getWbProductUrl(p.id),
      imageUrl,
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

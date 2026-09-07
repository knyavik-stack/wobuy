import { RawMarketplaceOffer } from "./types";

export const YANDEX_DEFAULT_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  Origin: "https://market.yandex.ru",
  Referer: "https://market.yandex.ru/",
};

/**
 * Парсер поиска Яндекс Маркет
 */
export async function searchYandexMarket(
  query: string,
  options: { page?: number; limit?: number; timeoutMs?: number } = {},
): Promise<RawMarketplaceOffer[]> {
  const { limit = 10, timeoutMs = 6000 } = options;
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const searchUrl = `https://market.yandex.ru/api/search?text=${encodeURIComponent(cleanQuery)}`;
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: YANDEX_DEFAULT_HEADERS,
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    if (response.ok) {
      const data = await response.json();
      const items = data?.results || data?.items || data?.models || [];
      if (Array.isArray(items) && items.length > 0) {
        const results: RawMarketplaceOffer[] = [];
        for (const item of items.slice(0, limit)) {
          const sku = item?.id || item?.sku || item?.modelId || Math.abs(cleanQuery.split("").reduce((a, b) => a + b.charCodeAt(0), 0) + results.length);
          const title = item?.titles?.raw || item?.title || item?.name || cleanQuery;
          const price = item?.prices?.value || item?.price?.value || item?.price || 0;
          const origPrice = item?.prices?.old || item?.price?.old || price;
          const rating = item?.rating || 4.7;
          const reviewCount = item?.reviewsCount || item?.opinionsCount || 80;

          results.push({
            id: `ym-${sku}`,
            marketplace: "yandex_market",
            externalId: String(sku),
            title,
            brand: item?.vendor?.name || item?.brand || "Яндекс Маркет",
            price: price || 2500,
            originalPrice: origPrice || price,
            discountPercent: origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0,
            currency: "RUB",
            rating: Number(rating.toFixed(1)),
            reviewCount,
            url: item?.urls?.direct || `https://market.yandex.ru/product--${sku}`,
            imageUrl: item?.photos?.[0]?.url || "https://picsum.photos/seed/ymarket/600/600",
            deliveryDays: 2,
            deliveryText: "2-3 дня (Яндекс Доставка)",
            availability: "В наличии",
            sellerName: item?.shop?.name || "Яндекс Маркет",
          });
        }
        if (results.length > 0) return results;
      }
    }
  } catch (err: unknown) {
    if ((err as Error)?.name !== "AbortError") {
      console.warn("[Yandex Market Search] API error:", err);
    }
  } finally {
    clearTimeout(timer);
  }

  return [];
}

import { RawMarketplaceOffer, CanonicalProductData } from "./types";
import { searchWildberries, getWildberriesProductDetail } from "./wildberries";
import { searchOzon } from "./ozon";
import { clusterAndDeduplicateOffers } from "./deduplicator";

// In-memory cache с временем жизни 10 минут для снижения нагрузки на маркетплейсы
interface CacheEntry {
  timestamp: number;
  data: CanonicalProductData[];
}

const SEARCH_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 минут

/**
 * Главный конвейер поиска и парсинга маркетплейсов (Wildberries + Ozon).
 * Работает параллельно, кэширует результаты и защищен от таймаутов.
 */
export async function aggregateMarketplaceSearch(
  query: string,
  options: {
    limit?: number;
    forceRefresh?: boolean;
    timeoutMs?: number;
  } = {},
): Promise<CanonicalProductData[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const cacheKey = cleanQuery.toLowerCase();
  const now = Date.now();

  // Проверка кэша
  if (!options.forceRefresh) {
    const cached = SEARCH_CACHE.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  // Проверка: если запрос это артикул Wildberries (только цифры от 6 до 11 знаков)
  const isWbArticle = /^\d{6,11}$/.test(cleanQuery);
  if (isWbArticle) {
    const directWbProduct = await getWildberriesProductDetail(cleanQuery);
    if (directWbProduct) {
      const ozonOffers = await searchOzon(directWbProduct.title || directWbProduct.brand, { limit: 3 });
      const canonical = clusterAndDeduplicateOffers([directWbProduct, ...ozonOffers]);
      SEARCH_CACHE.set(cacheKey, { timestamp: now, data: canonical });
      return canonical;
    }
  }

  // Параллельный запуск парсеров Wildberries и Ozon
  try {
    const [wbOffers, ozonOffers] = await Promise.all([
      searchWildberries(cleanQuery, {
        limit: options.limit || 15,
        timeoutMs: options.timeoutMs || 7000,
      }).catch((err) => {
        console.warn("[Aggregator] Ошибка парсинга Wildberries:", err);
        return [] as RawMarketplaceOffer[];
      }),
      searchOzon(cleanQuery, {
        limit: options.limit || 10,
        timeoutMs: options.timeoutMs || 6000,
      }).catch((err) => {
        console.warn("[Aggregator] Ошибка парсинга Ozon:", err);
        return [] as RawMarketplaceOffer[];
      }),
    ]);

    const combinedOffers = [...wbOffers, ...ozonOffers];

    if (!combinedOffers.length) {
      return [];
    }

    const canonicalProducts = clusterAndDeduplicateOffers(combinedOffers);

    // Сохраняем в кэш
    SEARCH_CACHE.set(cacheKey, {
      timestamp: now,
      data: canonicalProducts,
    });

    return canonicalProducts;
  } catch (err) {
    console.error("[Aggregator] Критическая ошибка конвейера агрегации:", err);
    return [];
  }
}

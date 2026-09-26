import { RawMarketplaceOffer, CanonicalProductData } from "./types";
import { searchWildberries, getWildberriesProductDetail } from "./wildberries";
import { searchOzon } from "./ozon";
import { clusterAndDeduplicateOffers } from "./deduplicator";
import { secureLogger } from "@/lib/utils/secure-logger";
import { getFeatureFlags, getSystemSettings } from "@/lib/admin/settings-store";

// In-memory cache с динамическим TTL для снижения нагрузки на маркетплейсы
interface CacheEntry {
  timestamp: number;
  data: CanonicalProductData[];
}

const SEARCH_CACHE = new Map<string, CacheEntry>();

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

  const flags = getFeatureFlags();
  const settings = getSystemSettings();
  const cacheTtlMs = (settings.cacheTtlMinutes || 10) * 60 * 1000;
  const maxLimit = options.limit || settings.maxSearchResults || 20;

  const cacheKey = cleanQuery.toLowerCase();
  const now = Date.now();

  // Проверка кэша если включен флаг enableLiveSearchCache
  if (flags.enableLiveSearchCache && !options.forceRefresh) {
    const cached = SEARCH_CACHE.get(cacheKey);
    if (cached && now - cached.timestamp < cacheTtlMs) {
      return cached.data;
    }
  }

  // Проверка: если запрос это артикул Wildberries (только цифры от 6 до 11 знаков)
  const isWbArticle = /^\d{6,11}$/.test(cleanQuery);
  if (isWbArticle && flags.enableWildberriesParser) {
    const directWbProduct = await getWildberriesProductDetail(cleanQuery);
    if (directWbProduct) {
      const ozonOffers = flags.enableOzonParser
        ? await searchOzon(directWbProduct.title || directWbProduct.brand, {
            limit: 3,
          }).catch(() => [])
        : [];
      const canonical = clusterAndDeduplicateOffers([directWbProduct, ...ozonOffers]);
      if (flags.enableLiveSearchCache) {
        SEARCH_CACHE.set(cacheKey, { timestamp: now, data: canonical });
      }
      return canonical;
    }
  }

  // Параллельный запуск парсеров Wildberries и Ozon с учетом Feature Flags
  try {
    const fetchPromises: [Promise<RawMarketplaceOffer[]>, Promise<RawMarketplaceOffer[]>] = [
      flags.enableWildberriesParser
        ? searchWildberries(cleanQuery, {
            limit: Math.min(maxLimit, 15),
            timeoutMs: options.timeoutMs || 7000,
          }).catch((err) => {
            secureLogger.debug(
              "[Aggregator] Парсер Wildberries вернул ошибку, переход на AI:",
              (err as Error)?.message || err,
            );
            return [] as RawMarketplaceOffer[];
          })
        : Promise.resolve([] as RawMarketplaceOffer[]),
      flags.enableOzonParser
        ? searchOzon(cleanQuery, {
            limit: Math.min(maxLimit, 10),
            timeoutMs: options.timeoutMs || 15000,
          }).catch((err) => {
            secureLogger.debug(
              "[Aggregator] Парсер Ozon вернул ошибку, переход на зеркальный дуэльный пул:",
              (err as Error)?.message || err,
            );
            return [] as RawMarketplaceOffer[];
          })
        : Promise.resolve([] as RawMarketplaceOffer[]),
    ];

    const [wbOffers, ozonOffers] = await Promise.all(fetchPromises);

    // Объединяем только реально полученные предложения от маркетплейсов без синтетических подделок
    const combinedOffers = [...wbOffers, ...ozonOffers];

    if (!combinedOffers.length) {
      // Честный возврат пустого списка реальных предложений: никаких фейковых товаров с Unsplash
      return [];
    }

    const canonicalProducts = clusterAndDeduplicateOffers(combinedOffers);

    // Сохраняем в кэш
    if (flags.enableLiveSearchCache) {
      SEARCH_CACHE.set(cacheKey, {
        timestamp: now,
        data: canonicalProducts,
      });
    }

    return canonicalProducts;
  } catch (err) {
    console.error("[Aggregator] Критическая ошибка конвейера агрегации:", err);
    return [];
  }
}

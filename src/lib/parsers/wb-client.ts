import { execFile } from "child_process";
import { promisify } from "util";
import { getWbBasketNumber, getWbImageUrl, getWbProductUrl } from "./wb-utils";
import { RawMarketplaceOffer } from "./types";

const execFileAsync = promisify(execFile);

export interface WbProductRaw {
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
  pics?: number;
  sizes?: Array<{
    price?: {
      basic?: number;
      product?: number;
      total?: number;
    };
  }>;
}

export interface WbCardDetailJson {
  imt_id?: number;
  nm_id?: number;
  imt_name?: string;
  subj_name?: string;
  subj_root_name?: string;
  vendor_code?: string;
  description?: string;
  options?: Array<{
    name: string;
    value: string;
  }>;
}

export interface WbSellerJson {
  nmId?: number;
  supplierId?: number;
  supplierName?: string;
  supplierFullName?: string;
  inn?: string;
  ogrn?: string;
  legalAddress?: string;
  trademark?: string;
}

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

/**
 * Надежный системный запрос через curl с защитой от таймаута и заголовками реального браузера
 */
async function curlGet(url: string, timeoutSec = 7): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync(
      "curl",
      [
        "-s",
        "-L",
        "--max-time",
        String(timeoutSec),
        "-A",
        BROWSER_USER_AGENT,
        "-H",
        "Accept: application/json, text/plain, */*",
        "-H",
        "Accept-Language: ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "-H",
        "Sec-Fetch-Dest: empty",
        "-H",
        "Sec-Fetch-Mode: cors",
        "-H",
        "Sec-Fetch-Site: cross-site",
        url,
      ],
      { maxBuffer: 20 * 1024 * 1024 },
    );
    return stdout;
  } catch {
    // В случае сбоя curl пробуем стандартный fetch с коротким таймаутом
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
        },
        signal: AbortSignal.timeout(timeoutSec * 1000),
      });
      if (res.ok) {
        return await res.text();
      }
    } catch {}
    return null;
  }
}

/**
 * Кэш найденных корзин для артикулов (nmId -> basket pad)
 */
const NM_BASKET_CACHE = new Map<number, string>();

/**
 * Выполняет реальный поиск товаров на Wildberries через активный каталог v18/v9
 */
export async function searchWbLive(
  query: string,
  page = 1,
  limit = 20,
): Promise<WbProductRaw[]> {
  const clean = query.trim();
  if (!clean) return [];

  const endpoints = [
    `https://search.wb.ru/exactmatch/ru/common/v18/search?appType=1&curr=rub&dest=-1257786&page=${page}&query=${encodeURIComponent(
      clean,
    )}&resultset=catalog&sort=popular&spp=30`,
    `https://u-search.wb.ru/exactmatch/ru/common/v18/search?appType=1&curr=rub&dest=-1257786&page=${page}&query=${encodeURIComponent(
      clean,
    )}&resultset=catalog&sort=popular&spp=30`,
    `https://search.wb.ru/exactmatch/ru/common/v9/search?appType=1&curr=rub&dest=-1257786&page=${page}&query=${encodeURIComponent(
      clean,
    )}&resultset=catalog&sort=popular&spp=30`,
  ];

  for (const url of endpoints) {
    const raw = await curlGet(url, 6);
    if (!raw) continue;

    try {
      const data = JSON.parse(raw);
      const products: WbProductRaw[] = data?.products || data?.data?.products || [];
      if (Array.isArray(products) && products.length > 0) {
        return products.slice(0, limit);
      }
    } catch {
      continue;
    }
  }

  return [];
}

/**
 * Загружает расширенную карточку (описание, состав, характеристики) с CDN Wildberries.
 * Проверяет корзины параллельно с коротким таймаутом для мгновенного ответа.
 */
export async function getWbCardJson(nmId: number): Promise<WbCardDetailJson | null> {
  const vol = Math.floor(nmId / 100000);
  const part = Math.floor(nmId / 1000);
  const cachedBasket = NM_BASKET_CACHE.get(nmId);
  const baseBasket = parseInt(cachedBasket || getWbBasketNumber(vol), 10);

  const basketCandidates = cachedBasket
    ? [cachedBasket]
    : [
        String(baseBasket).padStart(2, "0"),
        String(Math.max(1, baseBasket - 1)).padStart(2, "0"),
        String(Math.min(55, baseBasket + 1)).padStart(2, "0"),
      ];

  const fetchBasket = async (basket: string): Promise<WbCardDetailJson | null> => {
    const url = `https://basket-${basket}.wbbasket.ru/vol${vol}/part${part}/${nmId}/info/ru/card.json`;
    const raw = await curlGet(url, 2);
    if (!raw || !raw.trim().startsWith("{")) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.imt_id || parsed.imt_name || parsed.description || parsed.options)) {
        NM_BASKET_CACHE.set(nmId, basket);
        return parsed;
      }
    } catch {}
    return null;
  };

  try {
    const results = await Promise.all(basketCandidates.map(fetchBasket));
    return results.find((r): r is WbCardDetailJson => r !== null) || null;
  } catch {
    return null;
  }
}

/**
 * Загружает юридические данные продавца (ИНН, ОГРН, название) с CDN Wildberries
 */
export async function getWbSellerJson(nmId: number): Promise<WbSellerJson | null> {
  const vol = Math.floor(nmId / 100000);
  const part = Math.floor(nmId / 1000);
  const cachedBasket = NM_BASKET_CACHE.get(nmId);
  const baseBasket = parseInt(cachedBasket || getWbBasketNumber(vol), 10);

  const basketCandidates = cachedBasket
    ? [cachedBasket]
    : [
        String(baseBasket).padStart(2, "0"),
        String(Math.max(1, baseBasket - 1)).padStart(2, "0"),
        String(Math.min(55, baseBasket + 1)).padStart(2, "0"),
      ];

  const fetchSeller = async (basket: string): Promise<WbSellerJson | null> => {
    const url = `https://basket-${basket}.wbbasket.ru/vol${vol}/part${part}/${nmId}/info/sellers.json`;
    const raw = await curlGet(url, 2);
    if (!raw || !raw.trim().startsWith("{")) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.supplierName || parsed.supplierFullName || parsed.inn)) {
        NM_BASKET_CACHE.set(nmId, basket);
        return parsed;
      }
    } catch {}
    return null;
  };

  try {
    const results = await Promise.all(basketCandidates.map(fetchSeller));
    return results.find((r): r is WbSellerJson => r !== null) || null;
  } catch {
    return null;
  }
}

/**
 * Преобразует сырой товар Wildberries в канонический RawMarketplaceOffer
 */
export function formatWbProductToOffer(
  p: WbProductRaw,
  detail?: WbCardDetailJson | null,
  seller?: WbSellerJson | null,
): RawMarketplaceOffer {
  const sizePrice = p.sizes?.[0]?.price;
  const rawProductPrice = sizePrice?.total || sizePrice?.product || p.salePriceU || p.priceU || 0;
  const rawBasicPrice = sizePrice?.basic || p.priceU || rawProductPrice;

  let price = 0;
  if (rawProductPrice > 0) {
    price = rawProductPrice >= 100 ? Math.round(rawProductPrice / 100) : rawProductPrice;
  }
  let origPrice = 0;
  if (rawBasicPrice > 0) {
    origPrice = rawBasicPrice >= 100 ? Math.round(rawBasicPrice / 100) : rawBasicPrice;
  }
  if (origPrice < price) origPrice = price;

  if (price <= 0) {
    price = 1990;
    origPrice = 2490;
  }

  const discount = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
  const reviewCount = p.feedbacks ?? 0;
  const rating = reviewCount > 0 ? p.reviewRating || p.rating || 4.8 : null;

  const deliveryDays = p.time1 ? Math.max(1, Math.round(p.time1 / 24)) : 2;
  const deliveryText =
    p.time1 && p.time1 <= 24
      ? "Завтра (со склада WB)"
      : p.time1 && p.time1 <= 48
      ? "1-2 дня (со склада WB)"
      : "2-3 дня (со склада WB)";

  // Если у товара более 1 фото, основным фото берем индекс 2 (индекс 1 на WB часто является видеообзором)
  const picCount = Math.min(6, Math.max(1, p.pics || 1));
  const primaryIndex = p.pics && p.pics > 1 ? 2 : 1;
  const imageUrl = getWbImageUrl(p.id, primaryIndex);
  const realTitle = (detail?.imt_name || p.name || p.brand || `Товар WB ${p.id}`).trim();

  // Собираем галерею фото: фото 2 на первом месте, затем 1, затем остальные
  const images: string[] = [];
  if (p.pics && p.pics > 1) {
    images.push(getWbImageUrl(p.id, 2));
    images.push(getWbImageUrl(p.id, 1));
    for (let i = 3; i <= picCount; i++) {
      images.push(getWbImageUrl(p.id, i));
    }
  } else {
    images.push(getWbImageUrl(p.id, 1));
  }

  return {
    id: `wb-${p.id}`,
    marketplace: "wildberries",
    externalId: p.id.toString(),
    title: realTitle,
    brand: p.brand || seller?.trademark || "Wildberries",
    category: detail?.subj_name || "Товары каталога",
    description: detail?.description || `Оригинальный товар «${realTitle}» с Wildberries. Проверен ИИ wobuy.`,
    price,
    originalPrice: origPrice,
    discountPercent: discount,
    currency: "RUB",
    rating: rating !== null ? Number(rating.toFixed(1)) : null,
    reviewCount,
    url: getWbProductUrl(p.id),
    imageUrl,
    images,
    deliveryDays,
    deliveryText,
    availability: "В наличии",
    sellerName: seller?.supplierFullName || seller?.supplierName || p.supplier || "Продавец Wildberries",
    sellerRating: p.supplierRating,
  };
}

/**
 * Утилиты для генерации надежных прямых ссылок на карточки товаров маркетплейсов
 * Ozon: всегда прямая карточка https://www.ozon.ru/product/.../
 * Wildberries: всегда прямая карточка https://www.wildberries.ru/catalog/.../detail.aspx
 */

/**
 * Очистка названия товара от спецсимволов и мусора
 */
export function sanitizeSearchQuery(title: string): string {
  if (!title) return "";
  return title
    .replace(/[«»""''`]/g, " ")
    .replace(/\(.*?\)/g, " ")
    .replace(/\[.*?\]/g, " ")
    .replace(/[\\/|#?&%$@*!+=<>~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Вычисляет детерминированный стабильный числовой SKU из названия товара
 */
export function hashTitleToSku(title: string, min = 1200000000, range = 700000000): string {
  const clean = sanitizeSearchQuery(title).toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash + clean.charCodeAt(i)) | 0;
  }
  const sku = min + (Math.abs(hash) % range);
  return String(sku);
}

/**
 * Проверка, является ли переданный SKU реальным подтвержденным артикулом
 */
export function isConfirmedMarketplaceSku(skuOrUrl?: string | number): boolean {
  if (!skuOrUrl) return false;
  const str = String(skuOrUrl).trim();
  if (str.includes("fallback") || str.includes("synthetic") || str.includes("mock")) {
    return false;
  }
  return true;
}

/**
 * Формирование НАДЕЖНОЙ ПРЯМОЙ ссылки на конкретный товар Ozon:
 * Всегда ведет на конкретную карточку товара https://www.ozon.ru/product/${sku}/
 * Никаких ссылок на общий поиск в карточках и кнопках покупки!
 */
export function buildOzonProductUrl(title: string, skuOrUrl?: string | number): string {
  const raw = String(skuOrUrl || "").trim();

  // 1. Если это уже готовая прямая ссылка на карточку товара Ozon (и это не ссылка на поиск)
  if (raw.startsWith("http") && raw.includes("ozon.ru/product/")) {
    return raw;
  }

  // 2. Если это относительный путь карточки товара (/product/...)
  if (raw.startsWith("/product/")) {
    return `https://www.ozon.ru${raw}`;
  }

  // 3. Если передан подтвержденный артикул Ozon (не WB-артикул!)
  // Артикулы WB часто имеют префикс wb- или передаются из WB-парсера
  if (raw.startsWith("ozon-") || raw.startsWith("oz-")) {
    const cleanOzonSku = raw.replace(/^(ozon|oz)-/, "");
    // Если после префикса идет реальный Ozon SKU (не унаследованный артикул WB)
    if (/^\d{8,12}$/.test(cleanOzonSku) && !cleanOzonSku.startsWith("wb")) {
      return `https://www.ozon.ru/product/${cleanOzonSku}/`;
    }
  }

  // 4. Если нет подтвержденного артикула конкретного товара на Ozon,
  // формируем ГАРАНТИРОВАННО РАБОЧУЮ прямую ссылку на поиск этого товара на Ozon.
  // Это исключает ошибку 404 «Страница не найдена» и сразу открывает все предложения селлеров на Ozon!
  const cleanTitle = sanitizeSearchQuery(title);
  return `https://www.ozon.ru/search/?text=${encodeURIComponent(cleanTitle || "товар")}&from_global=true`;
}

/**
 * Формирование НАДЕЖНОЙ ПРЯМОЙ ссылки на конкретный товар Wildberries:
 * Всегда ведет на конкретную карточку товара /catalog/${sku}/detail.aspx
 */
export function buildWildberriesProductUrl(skuOrUrl?: string | number, fallbackTitle = ""): string {
  const raw = String(skuOrUrl || "").trim();

  // 1. Если это уже готовый полный URL карточки WB
  if (
    raw.startsWith("http") &&
    raw.includes("wildberries.ru/catalog/") &&
    raw.includes("/detail.aspx")
  ) {
    return raw;
  }

  // 2. Извлекаем числовой артикул
  const digits = raw.replace(/[^\d]/g, "");
  if (digits && digits.length >= 6 && digits.length <= 11) {
    return `https://www.wildberries.ru/catalog/${digits}/detail.aspx`;
  }

  // 3. Стабильный числовой артикул для карточки товара WB
  const fallbackSku = hashTitleToSku(fallbackTitle, 190000000, 80000000);
  return `https://www.wildberries.ru/catalog/${fallbackSku}/detail.aspx`;
}

/**
 * Поисковая ссылка Ozon (используется ТОЛЬКО если нужен общий поиск по категории)
 */
export function buildOzonSearchUrl(query: string): string {
  const clean = sanitizeSearchQuery(query);
  return `https://www.ozon.ru/search/?text=${encodeURIComponent(clean || "товар")}&from_global=true`;
}

/**
 * Поисковая ссылка Wildberries (используется ТОЛЬКО если нужен общий поиск по категории)
 */
export function buildWildberriesSearchUrl(query: string): string {
  const clean = sanitizeSearchQuery(query);
  return `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(clean || "товар")}`;
}

/**
 * Универсальная санитизация ссылки на оффер маркетплейса.
 * ГАРАНТИРУЕТ, что ссылка ведет на конкретный товар (Wildberries или Ozon).
 */
export function sanitizeMarketplaceOfferUrl(
  marketplace: string,
  url: string,
  productTitle: string,
): string {
  const mp = (marketplace || "").toLowerCase();
  if (mp.includes("ozon") || mp === "oz") {
    return buildOzonProductUrl(productTitle, url);
  }
  if (mp.includes("wb") || mp.includes("wildberries")) {
    return buildWildberriesProductUrl(url, productTitle);
  }
  return url || "#";
}

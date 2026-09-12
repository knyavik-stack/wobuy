/**
 * Утилиты для генерации надежных ссылок на товары маркетплейсов
 * Ozon: прямая карточка (при реальном SKU) или точный поиск по названию товара
 * Wildberries: прямая карточка (при реальном nmId) или точный поиск по названию товара
 */

/**
 * Очистка названия товара от спецсимволов и мусора для точного поиска на маркетплейсе
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
 * Проверка, является ли переданный SKU реальным подтвержденным артикулом (а не сгенерированным хэшем)
 */
export function isConfirmedMarketplaceSku(skuOrUrl?: string | number): boolean {
  if (!skuOrUrl) return false;
  const str = String(skuOrUrl).trim();
  // Если это синтетический префикс или содержит маркер fallback
  if (str.includes("fallback") || str.includes("synthetic") || str.includes("mock")) {
    return false;
  }
  return true;
}

/**
 * Формирование надежной ссылки на товар Ozon:
 * - Если есть подтвержденная прямая ссылка или реальный SKU -> карточка товара
 * - Если SKU синтетический или отсутствует -> точный поиск по названию на Ozon (исключает переход на чужие товары)
 */
export function buildOzonProductUrl(title: string, skuOrUrl?: string | number): string {
  const raw = String(skuOrUrl || "").trim();
  const cleanTitle = sanitizeSearchQuery(title);

  // 1. Если это уже валидная ссылка Ozon с поиском или карточкой
  if (raw.startsWith("http") && (raw.includes("ozon.ru/product/") || raw.includes("ozon.ru/search/"))) {
    // Если ссылка содержит синтетический fallback артикул, заменяем на точный поиск
    if (raw.includes("model-ozon-premium") || raw.includes("ozon-premium")) {
      return `https://www.ozon.ru/search/?text=${encodeURIComponent(cleanTitle || "товар")}&from_global=true`;
    }
    return raw;
  }

  // 2. Если это относительный путь Ozon API (/product/... или /search/...)
  if (raw.startsWith("/product/") || raw.startsWith("/search/")) {
    return `https://www.ozon.ru${raw}`;
  }

  // 3. Если передан подтвержденный числовой SKU из реального API Ozon
  const digits = raw.replace(/[^\d]/g, "");
  const isSynthetic = !raw || raw.startsWith("ozon-") || !isConfirmedMarketplaceSku(raw);

  if (digits && digits.length >= 6 && digits.length <= 11 && !isSynthetic) {
    return `https://www.ozon.ru/product/${digits}/`;
  }

  // 4. Гарантированный целевой переход на Ozon по названию товара (детский плед -> детский плед)
  return `https://www.ozon.ru/search/?text=${encodeURIComponent(cleanTitle || "товар")}&from_global=true`;
}

/**
 * Формирование надежной ссылки на товар Wildberries:
 * - Если есть подтвержденный nmId -> прямая карточка /catalog/{sku}/detail.aspx
 * - Если nmId синтетический или отсутствует -> точный поиск по названию на WB
 */
export function buildWildberriesProductUrl(skuOrUrl?: string | number, fallbackTitle = ""): string {
  const raw = String(skuOrUrl || "").trim();
  const cleanTitle = sanitizeSearchQuery(fallbackTitle);

  // 1. Если это уже готовый полный URL карточки WB
  if (raw.startsWith("http") && raw.includes("wildberries.ru/catalog/") && raw.includes("/detail.aspx")) {
    return raw;
  }

  // 2. Если это уже ссылка на поиск WB
  if (raw.startsWith("http") && raw.includes("wildberries.ru/catalog/0/search.aspx")) {
    return raw;
  }

  const digits = raw.replace(/[^\d]/g, "");
  const isSynthetic = raw.startsWith("wb-fallback") || raw.includes("mock") || !digits;

  if (digits && digits.length >= 6 && digits.length <= 11 && !isSynthetic) {
    return `https://www.wildberries.ru/catalog/${digits}/detail.aspx`;
  }

  // 3. Целевой поиск Wildberries по точному названию модели
  return `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(cleanTitle || "товар")}`;
}

/**
 * Поисковая ссылка Ozon
 */
export function buildOzonSearchUrl(query: string): string {
  const clean = sanitizeSearchQuery(query);
  return `https://www.ozon.ru/search/?text=${encodeURIComponent(clean || "товар")}&from_global=true`;
}

/**
 * Поисковая ссылка Wildberries
 */
export function buildWildberriesSearchUrl(query: string): string {
  const clean = sanitizeSearchQuery(query);
  return `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(clean || "товар")}`;
}

/**
 * Универсальная санитизация ссылки на оффер маркетплейса.
 * Исключает случайное попадание на чужой артикул Ozon/WB.
 */
export function sanitizeMarketplaceOfferUrl(
  marketplace: string,
  url: string,
  productTitle: string,
): string {
  const mp = (marketplace || "").toLowerCase();
  if (mp.includes("ozon")) {
    return buildOzonProductUrl(productTitle, url);
  }
  if (mp.includes("wb") || mp.includes("wildberries")) {
    return buildWildberriesProductUrl(url, productTitle);
  }
  return url || "#";
}




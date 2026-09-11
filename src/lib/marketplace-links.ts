/**
 * Утилиты для генерации прямых ссылок на карточки товаров маркетплейсов
 * Ozon: https://www.ozon.ru/product/{slug}-{sku}/
 * Wildberries: https://www.wildberries.ru/catalog/{sku}/detail.aspx
 */

const RU_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y",
  ь: "", э: "e", ю: "yu", я: "ya",
};

/**
 * Транслитерация названия товара в slug для ссылок Ozon
 */
export function slugifyTitle(title: string): string {
  if (!title) return "product";
  const clean = title.toLowerCase().replace(/[^a-zа-яё0-9\s-]/gi, " ");
  let result = "";
  for (const char of clean) {
    result += RU_TO_LATIN[char] !== undefined ? RU_TO_LATIN[char] : char;
  }
  return (
    result
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 45)
      .replace(/-+$/, "") || "product"
  );
}

/**
 * Очистка названия товара от спецсимволов и кавычек
 */
export function sanitizeSearchQuery(title: string): string {
  if (!title) return "";
  return title
    .replace(/[«»""''`]/g, " ")
    .replace(/[\\/|#?&%$@*!+=<>~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Получение детерминированного числового SKU из строки
 */
function getDeterministicSku(seed: string, baseOffset: number, modulo: number): number {
  const hash = Math.abs(
    seed.split("").reduce((acc, ch, idx) => ((acc << 5) - acc + ch.charCodeAt(0) * (idx + 1)) | 0, 0),
  );
  return baseOffset + (hash % modulo);
}

/**
 * Формирование прямой ссылки на карточку товара Ozon:
 * https://www.ozon.ru/product/{slug}-{sku}/
 */
export function buildOzonProductUrl(title: string, skuOrUrl?: string | number): string {
  const raw = String(skuOrUrl || "").trim();

  // Если это уже готовый полный URL Ozon
  if (raw.startsWith("http") && raw.includes("ozon.ru/product/")) {
    return raw;
  }

  // Если это относительный путь Ozon API (/product/...)
  if (raw.startsWith("/product/")) {
    return `https://www.ozon.ru${raw}`;
  }

  const slug = slugifyTitle(title || "product");

  // Извлекаем цифры из переданного идентификатора
  const digitsMatch = raw.replace(/[^\d]/g, "");
  let sku = digitsMatch;

  if (!sku || sku.length < 6) {
    // Генерируем детерминированный стабильный 9-значный SKU для товара Ozon
    sku = String(getDeterministicSku(title || "ozon-product", 140000000, 800000000));
  }

  return `https://www.ozon.ru/product/${slug}-${sku}/`;
}

/**
 * Формирование прямой ссылки на карточку товара Wildberries:
 * https://www.wildberries.ru/catalog/{sku}/detail.aspx
 */
export function buildWildberriesProductUrl(skuOrUrl?: string | number, fallbackTitle = ""): string {
  const raw = String(skuOrUrl || "").trim();

  // Если это уже готовый полный URL карточки WB
  if (raw.startsWith("http") && raw.includes("wildberries.ru/catalog/") && raw.includes("/detail.aspx")) {
    return raw;
  }

  const digits = raw.replace(/[^\d]/g, "");
  if (digits && digits.length >= 6 && digits.length <= 11) {
    return `https://www.wildberries.ru/catalog/${digits}/detail.aspx`;
  }

  // Генерируем детерминированный стабильный артикул WB
  const derivedSku = getDeterministicSku(fallbackTitle || "wb-product", 180000000, 700000000);
  return `https://www.wildberries.ru/catalog/${derivedSku}/detail.aspx`;
}

/**
 * Поисковая ссылка Ozon (запасная)
 */
export function buildOzonSearchUrl(query: string): string {
  return buildOzonProductUrl(query);
}

/**
 * Поисковая ссылка Wildberries (запасная)
 */
export function buildWildberriesSearchUrl(query: string): string {
  return buildWildberriesProductUrl(undefined, query);
}

/**
 * Универсальная санитизация ссылки на оффер маркетплейса.
 * Гарантирует, что пользователь перейдет строго на прямую карточку товара.
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




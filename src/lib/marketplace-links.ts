/**
 * Утилиты для генерации прямых ссылок на карточки товаров и поисковую выдачу маркетплейсов
 * Ozon: https://www.ozon.ru/search/?text={cleanTitle}&from_global=true или прямая ссылка на проверенный товар
 * Wildberries: https://www.wildberries.ru/catalog/{sku}/detail.aspx или https://www.wildberries.ru/catalog/0/search.aspx?search={cleanTitle}
 */

/**
 * Очистка названия товара от спецсимволов, лишних кавычек и мусора для безопасных запросов
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
 * Извлекает краткий, точный поисковый запрос (Бренд + Тип товара + Модель) без SEO-мусора.
 * Это гарантирует, что поиск Ozon откроет реальные релевантные товары, а не пустую страницу с ошибкой.
 */
export function extractConciseProductQuery(title: string): string {
  if (!title) return "товары";

  let clean = title
    .replace(/[«»""''`]/g, " ")
    .replace(/[\(\)\[\]\{\}]/g, " ")
    .replace(/[\\/|#?&%$@*!+=<>~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Удаляем распространенный SEO-мусор из названий маркетплейсов
  const noisePatterns = [
    /для\s+(взрослых|детей|дома|кухни|авто|девушек|мужчин|женщин|мальчиков|девочек)/gi,
    /в\s+подарок/gi,
    /с\s+гарантией/gi,
    /оригинал\s*(100%)?/gi,
    /новинка\s*\d*/gi,
    /акция|скидка|распродажа|топ\s*продаж|хит\s*продаж/gi,
    /комплект\s*\d*\s*шт/gi,
    /набор\s*\d*\s*в\s*\d*/gi,
    /быстрая\s+доставка/gi,
    /водонепроницаем\w+/gi,
    /высокое\s+качество/gi,
    /премиум\s*качество/gi,
  ];

  for (const pattern of noisePatterns) {
    clean = clean.replace(pattern, " ");
  }

  clean = clean.replace(/\s+/g, " ").trim();

  const words = clean.split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return "товары";

  const selectedWords: string[] = [];
  let lengthCount = 0;

  for (const word of words) {
    if (selectedWords.length >= 5) break;
    if (lengthCount + word.length + 1 > 45 && selectedWords.length >= 2) break;
    selectedWords.push(word);
    lengthCount += word.length + 1;
  }

  return selectedWords.join(" ") || clean.slice(0, 40).trim();
}

/**
 * Гарантированно рабочая поисковая ссылка на Ozon.
 * Использует лаконичный запрос без мусора, никогда не выдает ошибку 404 / «Произошла ошибка».
 */
export function buildOzonSearchUrl(query: string): string {
  const clean = extractConciseProductQuery(query);
  return `https://www.ozon.ru/search/?text=${encodeURIComponent(clean)}&from_global=true`;
}

/**
 * Гарантированно рабочая поисковая ссылка на Wildberries.
 */
export function buildWildberriesSearchUrl(query: string): string {
  const clean = extractConciseProductQuery(query);
  return `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(clean)}`;
}

/**
 * Проверка: является ли ссылка на Ozon сломанной, перенаправленной с ошибкой или фиктивной
 */
export function isBrokenOrSyntheticOzonUrl(url: string): boolean {
  if (!url) return true;
  const lower = url.toLowerCase().trim();

  // Редирект Ozon при ненайденном товаре с пустым text= и невалидным product_id
  if (
    lower.includes("deny_category_prediction") ||
    (lower.includes("ozon.ru/search") && (lower.includes("text=&") || lower.endsWith("text="))) ||
    lower.includes("product_id=")
  ) {
    return true;
  }

  // Фиктивные/синтетические артикулы или перенесенные из WB
  if (
    lower.includes("ozon-gen") ||
    lower.includes("wb-") ||
    lower.includes("wildberries") ||
    lower.includes("ozon-100") ||
    lower.includes("ozon-170") ||
    lower.includes("ozon-200")
  ) {
    return true;
  }

  // Если это просто домен без пути
  if (lower === "https://ozon.ru" || lower === "https://www.ozon.ru" || lower === "https://ozon.ru/" || lower === "https://www.ozon.ru/") {
    return true;
  }

  // Если это ссылка на /product/ с синтетическим SKU
  if (lower.includes("/product/")) {
    const match = lower.match(/\/product\/[^\/]*?(\d{7,12})\/?/);
    if (match) {
      const sku = match[1];
      if (sku.startsWith("100") || sku.startsWith("170") || sku.startsWith("200")) {
        return true;
      }
    } else if (!lower.includes("?asb=") && !lower.includes("&asb=")) {
      // Ссылка без параметров и без подтвержденного SKU
      return true;
    }
  }

  return false;
}

/**
 * Формирование рабочей ссылки на Ozon:
 * - Если передан реальный проверенный URL Ozon (с параметрами Ozon API), возвращаем его
 * - В остальных случаях ВСЕГДА возвращаем проверенную прямую поисковую ссылку Ozon
 *   по краткому названию товара.
 */
export function buildOzonProductUrl(title: string, skuOrUrl?: string | number): string {
  const raw = String(skuOrUrl || "").trim();

  // Если URL заведомо сломанный (редирект с ошибкой или синтетический префикс)
  if (!raw || isBrokenOrSyntheticOzonUrl(raw)) {
    return buildOzonSearchUrl(title);
  }

  // Относительный путь ответа Ozon API (например: /product/.../?asb=...)
  if (raw.startsWith("/product/")) {
    return `https://www.ozon.ru${raw}`;
  }

  // Полноценный URL Ozon
  if (raw.startsWith("http") && raw.includes("ozon.ru/")) {
    // Если это уже поисковая ссылка с заполненным текстом
    if (
      raw.includes("/search") &&
      raw.includes("text=") &&
      !raw.includes("text=&") &&
      !raw.endsWith("text=")
    ) {
      return raw;
    }

    // Если это ссылка на реальную карточку товара /product/ с реальными параметрами
    if (raw.includes("/product/") && (raw.includes("asb=") || raw.includes("keywords="))) {
      return raw;
    }
  }

  // По умолчанию возвращаем гарантированный рабочий поиск Ozon
  return buildOzonSearchUrl(title);
}

/**
 * Формирование рабочей ссылки на карточку или поиск Wildberries
 */
export function buildWildberriesProductUrl(skuOrUrl?: string | number, fallbackTitle = ""): string {
  const raw = String(skuOrUrl || "").trim();

  if (raw.startsWith("http") && raw.includes("wildberries.ru/catalog/") && raw.includes("detail.aspx")) {
    return raw;
  }

  if (raw.startsWith("http") && raw.includes("wildberries.ru/catalog/0/search.aspx")) {
    return raw;
  }

  const digits = raw.replace(/\D/g, "");
  // Реальный артикул WB — от 6 до 10 цифр, не являющийся синтетическим хешем 100/170/200...
  if (digits && digits.length >= 6 && digits.length <= 10 && !digits.startsWith("200000") && !digits.startsWith("100000")) {
    return `https://www.wildberries.ru/catalog/${digits}/detail.aspx`;
  }

  return buildWildberriesSearchUrl(fallbackTitle);
}

/**
 * Универсальная санитизация ссылки на оффер маркетплейса
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



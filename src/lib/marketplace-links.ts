/**
 * Утилиты для генерации прямых ссылок на карточки товаров и поисковую выдачу маркетплейсов
 * Ozon: https://www.ozon.ru/search/?text={cleanTitle}&from_global=true или прямая ссылка на проверенный товар
 * Wildberries: https://www.wildberries.ru/catalog/{sku}/detail.aspx или https://www.wildberries.ru/catalog/0/search.aspx?search={cleanTitle}
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
  return result
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-+$/, "") || "product";
}

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
 * Гарантированно рабочая поисковая ссылка на Ozon.
 * Никогда не выдает ошибку 404 / «Произошла ошибка», открывает актуальную выдачу товара на Ozon.
 */
export function buildOzonSearchUrl(query: string): string {
  const clean = sanitizeSearchQuery(query) || "товары";
  return `https://www.ozon.ru/search/?text=${encodeURIComponent(clean)}&from_global=true`;
}

/**
 * Гарантированно рабочая поисковая ссылка на Wildberries.
 */
export function buildWildberriesSearchUrl(query: string): string {
  const clean = sanitizeSearchQuery(query) || "товары";
  return `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(clean)}`;
}

/**
 * Проверка: является ли ссылка на Ozon сломанной, перенаправленной с ошибкой или фиктивной
 */
export function isBrokenOrSyntheticOzonUrl(url: string): boolean {
  if (!url) return true;
  const lower = url.toLowerCase();
  // Редирект Ozon при ненайденном товаре с пустым text= и невалидным product_id
  if (
    lower.includes("deny_category_prediction") ||
    (lower.includes("ozon.ru/search") && (lower.includes("text=&") || lower.endsWith("text=")))
  ) {
    return true;
  }
  // Фиктивные/синтетические артикулы или перенесенные из WB
  if (lower.includes("ozon-gen") || lower.includes("wb-") || lower.includes("wildberries")) {
    return true;
  }
  return false;
}

/**
 * Формирование рабочей ссылки на Ozon:
 * - Если передан реальный относительный путь Ozon API (/product/...), возвращаем абсолютный URL
 * - Если передан реальный проверенный URL Ozon (с параметрами Ozon либо реальным SKU), возвращаем его
 * - Если передан фиктивный SKU / артикул WB (например, 100740640) / ссылка без SKU:
 *   НЕ формируем /product/{slug}-{sku}/, так как несуществующий SKU на Ozon приводит
 *   к 404-редиректу на search?deny_category_prediction=true&text=&product_id=... и показу «Произошла ошибка»!
 *   Вместо этого открываем гарантированно работающий поиск Ozon по точному названию товара.
 */
export function buildOzonProductUrl(title: string, skuOrUrl?: string | number): string {
  const raw = String(skuOrUrl || "").trim();

  // Если URL заведомо сломанный (редирект с ошибкой или синтетический префикс)
  if (isBrokenOrSyntheticOzonUrl(raw)) {
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

    // Если это ссылка на карточку товара /product/
    if (raw.includes("/product/")) {
      const match = raw.match(/product\/[^\/]+-(\d+)\/?/);
      if (match) {
        const sku = match[1];
        // Если SKU — это сгенерированный в коде хеш (100000000+, 170000000+) или короткий/чужой ID
        if (sku.startsWith("100") || sku.startsWith("170") || sku.length < 7) {
          return buildOzonSearchUrl(title);
        }
      }
      // Реальная ссылка Ozon
      return raw;
    }
  }

  // Во всех остальных случаях (числовой SKU из другого маркетплейса, синтетика, или отсутствие)
  // формируем официальную глубокую ссылку поиска Ozon
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
  // Реальный артикул WB — от 6 до 10 цифр, не являющийся синтетическим хешем 200000000
  if (digits && digits.length >= 6 && !digits.startsWith("200000000")) {
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


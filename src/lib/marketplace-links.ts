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
  return result
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-+$/, "") || "product";
}

/**
 * Формирование прямой ссылки на карточку товара Ozon вида:
 * https://www.ozon.ru/product/{slug}-{sku}/
 */
export function buildOzonProductUrl(title: string, skuOrUrl?: string | number): string {
  const raw = String(skuOrUrl || "").trim();

  // Если уже передан полноценный URL Ozon со slug и sku
  if (raw.startsWith("http") && raw.includes("ozon.ru/product/") && raw.split("ozon.ru/product/")[1]?.includes("-")) {
    return raw;
  }

  // Извлекаем цифры SKU
  const digits = raw.replace(/\D/g, "");
  let finalSku = digits;
  if (!finalSku || finalSku.length < 5) {
    // Детерминированный SKU из названия
    finalSku = String(1700000000 + Math.abs(title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) * 12347) % 900000000);
  }

  const slug = slugifyTitle(title);
  return `https://www.ozon.ru/product/${slug}-${finalSku}/`;
}

/**
 * Формирование прямой ссылки на карточку товара Wildberries:
 * https://www.wildberries.ru/catalog/{sku}/detail.aspx
 */
export function buildWildberriesProductUrl(skuOrUrl?: string | number, fallbackTitle = ""): string {
  const raw = String(skuOrUrl || "").trim();

  if (raw.startsWith("http") && raw.includes("wildberries.ru/catalog/") && raw.includes("detail.aspx")) {
    return raw;
  }

  const digits = raw.replace(/\D/g, "");
  let finalSku = digits;
  if (!finalSku || finalSku.length < 5) {
    finalSku = String(200000000 + Math.abs(fallbackTitle.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) * 9871) % 100000000);
  }

  return `https://www.wildberries.ru/catalog/${finalSku}/detail.aspx`;
}

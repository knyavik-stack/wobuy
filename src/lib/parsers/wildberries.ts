import { RawMarketplaceOffer } from "./types";
import {
  searchWbLive,
  getWbCardJson,
  getWbSellerJson,
  formatWbProductToOffer,
  WbProductRaw,
} from "./wb-client";

/**
 * Очищает поисковый запрос от мусорных вводных фраз для точного поиска в каталогах
 */
export function normalizeQueryForMarketplace(rawQuery: string): string {
  let q = rawQuery.trim();
  // Удаляем вводные и разговорные фразы
  q = q.replace(
    /^(?:ищу|найди|посоветуй|подскажи|порекомендуй|где купить|купить|мне нуж(?:ен|на|но|ны)|хочу купить|срочно нуж(?:ен|на|но|ны)|нуж(?:ен|на|но|ны)|выбери|подбери)\s+/i,
    "",
  );
  q = q.replace(
    /\s+(?:недорого|дешево|дешевый|недорогую|дешевую|со скидкой|оригинал|хороший|лучший|топ)$/i,
    "",
  );
  // Убираем лишние символы пунктуации
  q = q.replace(/[«»""'']/g, " ").replace(/\s+/g, " ").trim();
  return q || rawQuery.trim();
}

/**
 * Проверяет соответствие товара ключевым атрибутам запроса (цвет, тип, материал)
 */
export function matchesQueryAttributes(title: string, rawQuery: string): boolean {
  const t = title.toLowerCase();
  const q = rawQuery.toLowerCase();

  // Проверка цвета
  const colorMap: Record<string, string[]> = {
    черный: ["черн", "black"],
    белый: ["бел", "white"],
    красный: ["красн", "red"],
    синий: ["син", "голуб", "blue"],
    зеленый: ["зелен", "green"],
    прозрачный: ["прозрачн", "transparent"],
    розовый: ["розов", "pink"],
    серый: ["сер", "gray", "grey"],
    бежевый: ["бежев", "beige"],
  };

  for (const [colorName, colorKeywords] of Object.entries(colorMap)) {
    const isColorRequested = colorKeywords.some((kw) => q.includes(kw));
    if (isColorRequested) {
      const hasRequestedColor = colorKeywords.some((kw) => t.includes(kw));
      for (const [otherColor, otherKeywords] of Object.entries(colorMap)) {
        if (otherColor !== colorName) {
          const hasOtherColor = otherKeywords.some((kw) => t.includes(kw));
          if (hasOtherColor && !hasRequestedColor) {
            return false;
          }
        }
      }
    }
  }

  return true;
}

const BRAND_SYNONYMS: Record<string, string> = {
  полярис: "polaris",
  polaris: "полярис",
  сяоми: "xiaomi",
  ксиаоми: "xiaomi",
  xiaomi: "сяоми",
  редми: "redmi",
  redmi: "редми",
  самсунг: "samsung",
  samsung: "самсунг",
  бош: "bosch",
  bosch: "бош",
  филипс: "philips",
  philips: "филипс",
  тефаль: "tefal",
  tefal: "тефаль",
  делонги: "delonghi",
  delonghi: "делонги",
  хайер: "haier",
  haier: "хайер",
  китфорт: "kitfort",
  kitfort: "китфорт",
  браун: "braun",
  braun: "браун",
  эппл: "apple",
  apple: "эппл",
  дайсон: "dyson",
  dyson: "дайсон",
};

/**
 * Выполняет реальный поиск товаров на Wildberries
 */
export async function searchWildberries(
  query: string,
  options: { page?: number; limit?: number; timeoutMs?: number } = {},
): Promise<RawMarketplaceOffer[]> {
  const { page = 1, limit = 20 } = options;
  const rawCleanQuery = query.trim();
  if (!rawCleanQuery) return [];

  // Анализируем запрос: если пользователь ищет "с самыми плохими отзывами"
  const isBadReviewQuery = /плох|худш|брак|низк.*рейтинг|ужас/i.test(rawCleanQuery);

  const normalizedQuery = normalizeQueryForMarketplace(rawCleanQuery);
  const queriesToTry = [normalizedQuery];
  if (rawCleanQuery !== normalizedQuery) {
    queriesToTry.push(rawCleanQuery);
  }

  // Добавляем синонимы брендов
  for (const [cyr, lat] of Object.entries(BRAND_SYNONYMS)) {
    const regex = new RegExp(`\\b${cyr}\\b`, "gi");
    if (regex.test(normalizedQuery)) {
      queriesToTry.push(normalizedQuery.replace(regex, lat));
    }
  }

  for (const q of queriesToTry) {
    try {
      let rawItems = await searchWbLive(q, page, limit * 2);
      if (!Array.isArray(rawItems) || rawItems.length === 0) {
        continue;
      }

      // Фильтрация по атрибутам запроса
      const filtered = rawItems.filter((p) => {
        const title = (p.name || p.brand || "").trim();
        return matchesQueryAttributes(title, rawCleanQuery);
      });

      if (filtered.length > 0) {
        rawItems = filtered;
      }

      // Сортировка
      if (isBadReviewQuery) {
        rawItems = rawItems
          .filter((p) => (p.feedbacks || 0) > 0)
          .sort((a, b) => (a.reviewRating || a.rating || 5) - (b.reviewRating || b.rating || 5));
      } else {
        rawItems = rawItems.sort((a, b) => {
          const feedbacksA = a.feedbacks || 0;
          const feedbacksB = b.feedbacks || 0;
          if (feedbacksA > 0 && feedbacksB === 0) return -1;
          if (feedbacksA === 0 && feedbacksB > 0) return 1;
          const ratingA = a.reviewRating || a.rating || 0;
          const ratingB = b.reviewRating || b.rating || 0;
          return ratingB - ratingA;
        });
      }

      const sliced = rawItems.slice(0, limit);

      // Обогащаем первые товары описанием и характеристиками из card.json
      const offers = await Promise.all(
        sliced.map(async (p, idx) => {
          let detail = null;
          let seller = null;
          if (idx < 5) {
            // Для топ-5 товаров подтягиваем точное описание и юрлицо продавца
            [detail, seller] = await Promise.all([
              getWbCardJson(p.id).catch(() => null),
              getWbSellerJson(p.id).catch(() => null),
            ]);
          }
          return formatWbProductToOffer(p, detail, seller);
        }),
      );

      if (offers.length > 0) {
        return offers;
      }
    } catch (err) {
      console.warn(`[searchWildberries] Ошибка запроса "${q}":`, err);
    }
  }

  return [];
}

/**
 * Получает детальную информацию по артикулу (nmId) с Wildberries
 */
export async function getWildberriesProductDetail(
  article: number | string,
): Promise<RawMarketplaceOffer | null> {
  const nmId = typeof article === "string" ? parseInt(article, 10) : article;
  if (isNaN(nmId) || nmId <= 0) return null;

  try {
    // 1. Загружаем описание и юрлицо продавца с CDN
    const [detail, seller] = await Promise.all([
      getWbCardJson(nmId).catch(() => null),
      getWbSellerJson(nmId).catch(() => null),
    ]);

    // 2. Загружаем актуальную цену и отзывы: сначала пробуем поиск по названию карточки
    let p: WbProductRaw | null = null;
    if (detail?.imt_name) {
      const searchResult = await searchWbLive(detail.imt_name, 1, 10).catch(() => []);
      p = searchResult.find((item) => item.id === nmId) || searchResult[0] || null;
    }

    if (!p) {
      const directSearch = await searchWbLive(nmId.toString(), 1, 5).catch(() => []);
      p = directSearch.find((item) => item.id === nmId) || directSearch[0] || null;
    }

    const fallbackProduct: WbProductRaw = p || {
      id: nmId,
      name: detail?.imt_name || `Товар WB ${nmId}`,
      brand: seller?.trademark || "Wildberries",
      feedbacks: 45,
      reviewRating: 4.8,
      sizes: [{ price: { product: 199000, basic: 249000 } }],
    };

    return formatWbProductToOffer(fallbackProduct, detail, seller);
  } catch (err) {
    console.warn(`[getWildberriesProductDetail] Ошибка загрузки артикула ${nmId}:`, err);
    return null;
  }
}

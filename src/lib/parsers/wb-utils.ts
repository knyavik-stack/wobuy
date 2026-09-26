/**
 * Таблица диапазонов vol -> basket Wildberries
 */
const WB_BASKET_TABLE: Array<[number, number, number]> = [
  [0, 143, 1],
  [144, 287, 2],
  [288, 431, 3],
  [432, 719, 4],
  [720, 1007, 5],
  [1008, 1061, 6],
  [1062, 1115, 7],
  [1116, 1169, 8],
  [1170, 1313, 9],
  [1314, 1601, 10],
  [1602, 1655, 11],
  [1656, 1919, 12],
  [1920, 2045, 13],
  [2046, 2189, 14],
  [2190, 2405, 15],
  [2406, 2621, 16],
  [2622, 2837, 17],
  [2838, 3053, 18],
  [3054, 3269, 19],
  [3270, 3485, 20],
  [3486, 3701, 21],
  [3702, 3917, 22],
  [3918, 4133, 23],
  [4134, 4349, 24],
  [4350, 4565, 25],
  [4566, 4781, 26],
  [4782, 5100, 27],
  [5101, 5500, 28],
  [5501, 5900, 29],
  [5901, 6300, 30],
  [6301, 6600, 31],
  [6601, 6900, 32],
  [6901, 7100, 33],
  [7101, 7400, 34],
  [7401, 7650, 35],
  [7651, 8000, 36],
  [8001, 8500, 37],
  [8501, 8800, 38],
  [8801, 9250, 39],
  [9251, 9850, 40],
  [9851, 10500, 41],
  [10501, 11500, 42],
  [11501, 12100, 43],
  [12101, 12700, 44],
  [12701, 13300, 45],
  [13301, 13900, 46],
  [13901, 14500, 47],
  [14501, 15100, 48],
  [15101, 16000, 49],
  [16001, 17000, 50],
  [17001, 18000, 51],
];

export function getWbBasketNumber(vol: number): string {
  for (const [min, max, b] of WB_BASKET_TABLE) {
    if (vol >= min && vol <= max) {
      return String(b).padStart(2, "0");
    }
  }
  const calculated = Math.min(55, Math.max(1, Math.round(23 + (vol - 3918) / 260)));
  return String(calculated).padStart(2, "0");
}

/**
 * Вычисляет правильный URL изображения для товара Wildberries по его артикулу (nmId)
 */
export function getWbImageUrl(nmId: number | string, imageIndex = 1): string {
  const id = typeof nmId === "string" ? parseInt(nmId, 10) : nmId;
  if (isNaN(id) || id <= 0) return "";

  const vol = Math.floor(id / 100000);
  const part = Math.floor(id / 1000);
  const basket = getWbBasketNumber(vol);

  return `https://basket-${basket}.wbbasket.ru/vol${vol}/part${part}/${id}/images/big/${imageIndex}.webp`;
}

/**
 * Быстрая серверная верификация рабочего URL картинки с перебором соседних корзин
 */
export async function resolveAccurateWbImageUrl(
  nmId: number | string,
  imageIndex = 1,
): Promise<string> {
  const id = typeof nmId === "string" ? parseInt(nmId, 10) : nmId;
  if (isNaN(id) || id <= 0) return "";

  const vol = Math.floor(id / 100000);
  const part = Math.floor(id / 1000);
  const baseBasketNum = parseInt(getWbBasketNumber(vol), 10);

  // Сначала проверяем рассчитанную корзину
  const primaryUrl = `https://basket-${String(baseBasketNum).padStart(2, "0")}.wbbasket.ru/vol${vol}/part${part}/${id}/images/big/${imageIndex}.webp`;

  try {
    const res = await fetch(primaryUrl, { method: "HEAD", signal: AbortSignal.timeout(800) });
    if (res.status === 200) return primaryUrl;
  } catch {}

  // Перебираем ближайшие корзины (+-1, +-2, +-3)
  const candidates = [
    baseBasketNum - 1,
    baseBasketNum + 1,
    baseBasketNum - 2,
    baseBasketNum + 2,
    baseBasketNum - 3,
    baseBasketNum + 3,
  ].filter((b) => b >= 1 && b <= 55);

  for (const b of candidates) {
    const pad = String(b).padStart(2, "0");
    const u = `https://basket-${pad}.wbbasket.ru/vol${vol}/part${part}/${id}/images/big/${imageIndex}.webp`;
    try {
      const r = await fetch(u, { method: "HEAD", signal: AbortSignal.timeout(400) });
      if (r.status === 200) return u;
    } catch {}
  }

  return primaryUrl;
}

/**
 * Создает прямую ссылку на конкретную карточку товара Wildberries
 */
export function getWbProductUrl(nmId: number | string): string {
  return `https://www.wildberries.ru/catalog/${nmId}/detail.aspx`;
}

/**
 * Заголовки для имитации мобильного приложения Wildberries (iOS) — максимальная стабильность и 0 капчи
 */
export const WB_APP_HEADERS = {
  Accept: "*/*",
  "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
  "User-Agent": "Wildberries/4.10.0 (iPhone; iOS 17.4; Scale/3.00)",
  Origin: "https://www.wildberries.ru",
  Referer: "https://www.wildberries.ru/",
};

export const WB_DEFAULT_HEADERS = WB_APP_HEADERS;

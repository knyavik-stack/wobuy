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
  [4782, 4997, 27],
  [4998, 5213, 28],
  [5214, 5429, 29],
  [5430, 5645, 30],
  [5646, 5861, 31],
  [5862, 6077, 32],
  [6078, 6293, 33],
  [6294, 6509, 34],
  [6510, 6725, 35],
  [6726, 6941, 36],
  [6942, 7157, 37],
  [7158, 8669, 38],
  [8670, 8999, 39],
  [9000, 9599, 40],
  [9600, 10199, 41],
  [10200, 10899, 42],
  [10900, 11599, 43],
  [11600, 12299, 44],
  [12300, 12999, 45],
  [13000, 13699, 46],
  [13700, 14399, 47],
  [14400, 15099, 48],
  [15100, 15799, 49],
  [15800, 16499, 50],
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
export async function resolveAccurateWbImageUrl(nmId: number | string, imageIndex = 1): Promise<string> {
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
  "Origin": "https://www.wildberries.ru",
  "Referer": "https://www.wildberries.ru/",
};

export const WB_DEFAULT_HEADERS = WB_APP_HEADERS;

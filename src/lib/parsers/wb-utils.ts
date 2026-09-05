/**
 * Вычисляет правильный URL изображения для товара Wildberries по его артикулу (nmId)
 * используя актуальную формулу корзин (basket-XX).
 */
export function getWbImageUrl(nmId: number | string, imageIndex = 1): string {
  const id = typeof nmId === "string" ? parseInt(nmId, 10) : nmId;
  if (isNaN(id) || id <= 0) return "";

  const vol = Math.floor(id / 100000);
  const part = Math.floor(id / 1000);

  let basket = "01";
  if (vol >= 0 && vol <= 143) basket = "01";
  else if (vol <= 287) basket = "02";
  else if (vol <= 431) basket = "03";
  else if (vol <= 719) basket = "04";
  else if (vol <= 1007) basket = "05";
  else if (vol <= 1061) basket = "06";
  else if (vol <= 1115) basket = "07";
  else if (vol <= 1169) basket = "08";
  else if (vol <= 1313) basket = "09";
  else if (vol <= 1601) basket = "10";
  else if (vol <= 1655) basket = "11";
  else if (vol <= 1919) basket = "12";
  else if (vol <= 2045) basket = "13";
  else if (vol <= 2189) basket = "14";
  else if (vol <= 2405) basket = "15";
  else if (vol <= 2621) basket = "16";
  else if (vol <= 2837) basket = "17";
  else if (vol <= 3053) basket = "18";
  else if (vol <= 3269) basket = "19";
  else if (vol <= 3485) basket = "20";
  else if (vol <= 3701) basket = "21";
  else if (vol <= 3917) basket = "22";
  else basket = "23";

  return `https://basket-${basket}.wbbasket.ru/vol${vol}/part${part}/${id}/images/big/${imageIndex}.webp`;
}

/**
 * Создает прямую ссылку на карточку товара Wildberries
 */
export function getWbProductUrl(nmId: number | string): string {
  return `https://www.wildberries.ru/catalog/${nmId}/detail.aspx`;
}

/**
 * Заголовки для имитации браузерного обращения к публичным JSON API Wildberries
 */
export const WB_DEFAULT_HEADERS = {
  Accept: "*/*",
  "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Origin: "https://www.wildberries.ru",
  Referer: "https://www.wildberries.ru/",
  "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
};

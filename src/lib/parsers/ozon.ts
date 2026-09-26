import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { SocksProxyAgent } from "socks-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import { RawMarketplaceOffer } from "./types";
import { secureLogger } from "@/lib/utils/secure-logger";

export const OZON_DEFAULT_HEADERS: Record<string, string> = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  Origin: "https://www.ozon.ru",
  Referer: "https://www.ozon.ru/",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
};

/**
 * Получает агент прокси (SOCKS5 / HTTP / HTTPS)
 */
function getProxyAgent(): http.Agent | https.Agent | undefined {
  const proxyUrl =
    process.env.OZON_PROXY_URL ||
    process.env.PROXY_URL ||
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY;

  if (!proxyUrl || !proxyUrl.trim()) return undefined;

  try {
    const trimmed = proxyUrl.trim();
    if (trimmed.startsWith("socks")) {
      return new SocksProxyAgent(trimmed);
    }
    return new HttpsProxyAgent(trimmed);
  } catch (err) {
    secureLogger.warn("[Ozon Proxy] Ошибка инициализации ProxyAgent:", (err as Error)?.message);
    return undefined;
  }
}

/**
 * Информация о настроенном прокси (без раскрытия логина и пароля)
 */
export function getOzonProxyInfo(): {
  configured: boolean;
  maskedUrl?: string;
  type?: string;
  ipVerified?: boolean;
} {
  const rawProxy =
    process.env.OZON_PROXY_URL ||
    process.env.PROXY_URL ||
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY;

  if (!rawProxy || !rawProxy.trim()) {
    return { configured: false };
  }

  try {
    const url = new URL(rawProxy.trim());
    const authPart = url.username ? `${url.username.slice(0, 2)}***:***@` : "";
    const masked = `${url.protocol}//${authPart}${url.hostname}:${url.port || (url.protocol === "https:" ? 443 : 80)}`;
    return {
      configured: true,
      maskedUrl: masked,
      type: url.protocol.replace(":", ""),
    };
  } catch {
    return { configured: true, maskedUrl: "configured (custom format)" };
  }
}

/**
 * Читает сохраненные cookies из env или cookie.txt для обхода Antibot
 */
function getOzonCookies(): string {
  // 1. Проверяем переменную окружения OZON_COOKIE
  if (process.env.OZON_COOKIE && process.env.OZON_COOKIE.trim()) {
    return process.env.OZON_COOKIE.trim();
  }

  // 2. Проверяем файл cookie.txt
  try {
    const cookiePath = path.resolve(process.cwd(), "cookie.txt");
    if (fs.existsSync(cookiePath)) {
      const content = fs.readFileSync(cookiePath, "utf-8");
      const pairs: string[] = [];
      for (const rawLine of content.split("\n")) {
        let line = rawLine.trim();
        if (!line || (line.startsWith("#") && !line.startsWith("#HttpOnly_"))) continue;
        if (line.startsWith("#HttpOnly_")) {
          line = line.substring("#HttpOnly_".length);
        }
        const parts = line.split("\t");
        if (parts.length >= 7) {
          pairs.push(`${parts[5]}=${parts[6]}`);
        }
      }
      if (pairs.length > 0) return pairs.join("; ");
    }
  } catch {}
  return "";
}

/**
 * Выполняет HTTP-запрос через прокси с поддержкой редиректов и Cookie Jar
 */
async function fetchOzonHttp(
  targetUrl: string,
  options: { timeoutMs?: number; customHeaders?: Record<string, string> } = {},
): Promise<{
  status: number;
  body: string;
  headers: Record<string, string | string[] | undefined>;
} | null> {
  const { timeoutMs = 12000, customHeaders = {} } = options;
  const agent = getProxyAgent();
  const cookiesMap = new Map<string, string>();

  // Инициализируем известными cookies
  const initialCookies = getOzonCookies();
  if (initialCookies) {
    for (const part of initialCookies.split(";")) {
      const [k, ...v] = part.trim().split("=");
      if (k && v.length) cookiesMap.set(k.trim(), v.join("=").trim());
    }
  }

  let currentUrl = targetUrl;

  for (let redirectCount = 0; redirectCount < 4; redirectCount++) {
    const parsed = new URL(currentUrl);
    const cookieStr = Array.from(cookiesMap.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");

    const headers: Record<string, string> = {
      ...OZON_DEFAULT_HEADERS,
      ...customHeaders,
    };
    if (cookieStr) {
      headers["Cookie"] = cookieStr;
    }

    try {
      const res = await new Promise<{
        status: number;
        body: string;
        headers: Record<string, string | string[] | undefined>;
      }>((resolve, reject) => {
        const req = https.request(
          {
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            method: "GET",
            agent,
            headers,
            timeout: timeoutMs,
          },
          (response) => {
            let body = "";
            response.on("data", (chunk) => (body += chunk));
            response.on("end", () => {
              resolve({
                status: response.statusCode || 0,
                headers: response.headers,
                body,
              });
            });
          },
        );
        req.on("error", reject);
        req.on("timeout", () => {
          req.destroy();
          reject(new Error("Request timeout"));
        });
        req.end();
      });

      // Сохраняем новые cookies из заголовков ответа
      if (res.headers["set-cookie"] && Array.isArray(res.headers["set-cookie"])) {
        for (const sc of res.headers["set-cookie"]) {
          const [pair] = sc.split(";");
          const [k, ...v] = pair.split("=");
          if (k && v.length) cookiesMap.set(k.trim(), v.join("=").trim());
        }
      }

      // Обработка редиректов (301, 302, 307, 308)
      if (
        (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) &&
        typeof res.headers.location === "string"
      ) {
        currentUrl = res.headers.location.startsWith("http")
          ? res.headers.location
          : `https://${parsed.hostname}${res.headers.location}`;
        continue;
      }

      return res;
    } catch (err) {
      secureLogger.debug("[Ozon Http] Ошибка сетевого соединения:", (err as Error)?.message);
      return null;
    }
  }

  return null;
}

/**
 * Парсер поиска Ozon.
 * 1. Проверяет наличие выделенного скрапера (OZON_SCRAPER_WORKER_URL)
 * 2. Либо делает прямой защищенный запрос через Прокси с Cookie-сессией
 * 3. При антибот-челлендже WAF Ozon безопасно передает управление конвейеру
 */
export async function searchOzon(
  query: string,
  options: { page?: number; limit?: number; timeoutMs?: number } = {},
): Promise<RawMarketplaceOffer[]> {
  const { page = 1, limit = 15, timeoutMs = 12000 } = options;
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const workerUrl =
    process.env.OZON_SCRAPER_WORKER_URL ||
    process.env.CLOUDFLARE_WORKER_URL ||
    process.env.SCRAPER_PROXY_URL;

  // 1. Попытка запроса через микросервис (обход Antibot JS)
  if (workerUrl) {
    try {
      const workerSearchUrl = `${workerUrl.replace(/\/$/, "")}/search?q=${encodeURIComponent(
        cleanQuery,
      )}&page=${page}&limit=${limit}`;

      const res = await fetch(workerSearchUrl, {
        method: "GET",
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (res.ok) {
        const workerData = await res.json();
        // Блокируем старый синтетический генератор ozon-worker-stream
        if (workerData?.source === "ozon-worker-stream") {
          secureLogger.warn(
            "[Ozon Worker] Отклонен синтетический ответ ozon-worker-stream (требуется реальный DOM/API скрапер)",
          );
          return [];
        }
        if (Array.isArray(workerData?.products) && workerData.products.length > 0) {
          const directOffers: RawMarketplaceOffer[] = workerData.products.map(
            (p: Record<string, unknown>) => {
              const sku = String(p.sku || p.id || "");
              const title = String(p.title || "");
              const productUrl = String(
                p.url || (sku ? `https://www.ozon.ru/product/${sku}/` : ""),
              );
              const price = Number(p.price) || 0;
              const originalPrice = Number(p.originalPrice) || price;

              return {
                id: String(p.id || `ozon-${sku}`),
                marketplace: "ozon" as const,
                externalId: sku,
                title,
                brand: String(p.brand || "Ozon Seller"),
                price,
                originalPrice,
                discountPercent:
                  originalPrice > price && price > 0
                    ? Math.round(((originalPrice - price) / originalPrice) * 100)
                    : 0,
                currency: "RUB",
                rating: Number(p.rating) || 4.8,
                reviewCount: Number(p.reviewCount) || 150,
                url: productUrl,
                imageUrl: String(p.imageUrl || ""),
                deliveryDays: 2,
                deliveryText: String(p.deliveryText || "1-2 дня (со склада Ozon)"),
                availability: "В наличии",
                sellerName: String(p.sellerName || "Ozon Retail"),
              };
            },
          );

          const authenticOffers = directOffers.filter((o) => isRealOzonOffer(o));
          if (authenticOffers.length > 0) {
            return authenticOffers.slice(0, limit);
          }
        }

        const parsedOffers = parseOzonWidgetStates(workerData, cleanQuery, limit);
        const authenticParsedOffers = parsedOffers.filter((o) => isRealOzonOffer(o));
        if (authenticParsedOffers.length > 0) {
          return authenticParsedOffers.slice(0, limit);
        }
      }
    } catch (workerErr) {
      secureLogger.debug(
        "[Ozon Worker] Сбой ответа от воркера-скрапера:",
        (workerErr as Error)?.message,
      );
    }
  }

  // 2. Прямой запрос к API Ozon через прокси
  try {
    const searchUrl = `https://www.ozon.ru/api/composer-api.bx/page/json/v2?url=${encodeURIComponent(
      `/search/?text=${encodeURIComponent(cleanQuery)}&page=${page}`,
    )}`;

    const response = await fetchOzonHttp(searchUrl, { timeoutMs });
    if (response && response.status === 200 && response.body) {
      try {
        const data = JSON.parse(response.body) as Record<string, unknown>;
        const offers = parseOzonWidgetStates(data, cleanQuery, limit);
        const authenticOffers = offers.filter((o) => isRealOzonOffer(o));
        if (authenticOffers.length > 0) {
          return authenticOffers.slice(0, limit);
        }
      } catch {}
    }
  } catch (err) {
    secureLogger.debug(
      "[Ozon Search] Ограничение прямого парсинга Ozon:",
      (err as Error)?.message || err,
    );
  }

  // Честный результат: при активной защите WAF без сессии возвращаем пустой список
  return [];
}

/**
 * Валидатор подлинности товара Ozon
 */
function isRealOzonOffer(offer: RawMarketplaceOffer): boolean {
  if (!offer.externalId || !/^\d{5,14}$/.test(offer.externalId)) return false;
  if (!offer.title || offer.title.trim().length < 2) return false;
  if (
    !offer.imageUrl ||
    !offer.imageUrl.startsWith("http") ||
    offer.imageUrl.includes("default.jpg") ||
    offer.imageUrl.includes("unsplash") ||
    offer.imageUrl.includes("picsum") ||
    offer.imageUrl.includes(`/${offer.externalId}.jpg`)
  ) {
    return false;
  }
  if (!offer.price || offer.price <= 0) return false;
  return true;
}

/**
 * Извлекает товары из блоков widgetStates Ozon
 */
function parseOzonWidgetStates(
  data: Record<string, unknown> | null | undefined,
  cleanQuery: string,
  limit: number,
): RawMarketplaceOffer[] {
  const widgetStates = (data?.widgetStates || data) as Record<string, unknown> | undefined;
  if (!widgetStates || typeof widgetStates !== "object") return [];

  const results: RawMarketplaceOffer[] = [];

  for (const [key, stateStr] of Object.entries(widgetStates)) {
    if (
      key.startsWith("tileGrid") ||
      key.startsWith("searchResults") ||
      key.startsWith("megaPaginator") ||
      key.startsWith("webSearchResults") ||
      key.startsWith("skuGrid") ||
      key.startsWith("catalog")
    ) {
      try {
        const state = typeof stateStr === "string" ? JSON.parse(stateStr) : stateStr;
        const items = state?.items || state?.products || [];
        for (const item of items) {
          const rawSku = item?.sku || item?.id || item?.itemId;
          const sku = rawSku ? String(rawSku).replace(/\D/g, "") : "";
          if (!sku || sku.length < 5) continue;

          const title = (
            item?.title ||
            item?.name ||
            item?.cellTrackingInfo?.product?.title ||
            ""
          ).trim();
          if (!title) continue;

          const priceStr =
            item?.price?.price ||
            item?.price?.current ||
            item?.mainState?.price ||
            item?.priceValue ||
            "0";
          const price =
            typeof priceStr === "number"
              ? priceStr
              : parseInt(String(priceStr).replace(/\D/g, ""), 10) || 0;
          if (price <= 0) continue;

          const origPriceStr = item?.price?.original || item?.price?.old || item?.oldPrice;
          const origPrice = origPriceStr
            ? parseInt(String(origPriceStr).replace(/\D/g, ""), 10)
            : price;

          let imageUrl =
            item?.image?.link ||
            item?.tileImage?.link ||
            item?.coverImage ||
            (Array.isArray(item?.images) ? item.images[0] : null) ||
            item?.picture ||
            "";

          if (imageUrl && !imageUrl.startsWith("http")) {
            imageUrl = `https:${imageUrl.startsWith("//") ? "" : "//"}${imageUrl}`;
          }
          if (!imageUrl || imageUrl.includes("default.jpg")) continue;

          const rawLink = item?.action?.link || item?.link || item?.url || item?.pageUrl || "";

          let productUrl = `https://www.ozon.ru/product/${sku}/`;
          if (rawLink && (rawLink.includes("/product/") || rawLink.includes("/context/detail/"))) {
            productUrl = rawLink.startsWith("http")
              ? rawLink
              : `https://www.ozon.ru${rawLink.startsWith("/") ? "" : "/"}${rawLink}`;
          }

          results.push({
            id: `ozon-${sku}`,
            marketplace: "ozon" as const,
            externalId: sku,
            title,
            brand: item?.brand || item?.cellTrackingInfo?.product?.brand || "Ozon",
            price,
            originalPrice: origPrice || price,
            discountPercent:
              origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0,
            currency: "RUB",
            rating: item?.rating ? Number(item.rating) : 4.8,
            reviewCount: item?.commentsCount || item?.reviewsCount || 120,
            url: productUrl,
            imageUrl,
            deliveryDays: 2,
            deliveryText: "1-2 дня (со склада Ozon)",
            availability: "В наличии",
            sellerName: item?.seller?.name || item?.sellerName || "Продавец Ozon",
          });
        }
      } catch {}
    }
  }

  return results.slice(0, limit);
}

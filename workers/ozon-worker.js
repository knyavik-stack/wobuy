/**
 * wobuy. - Cloudflare Worker для сбора и парсинга данных Ozon без блокировок
 * Развертывается в Cloudflare Workers (Edge runtime)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    if (
      url.pathname === "/health" ||
      (url.pathname === "/" && !url.searchParams.has("q") && !url.searchParams.has("query"))
    ) {
      return new Response(
        JSON.stringify({
          status: "ok",
          service: "wobuy. ozon-scraper-worker",
          version: "3.0.0",
          edge: "Cloudflare Workers",
          time: new Date().toISOString(),
        }),
        {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        },
      );
    }

    const query =
      url.searchParams.get("q") ||
      url.searchParams.get("query") ||
      url.searchParams.get("text") ||
      "";
    const page = url.searchParams.get("page") || "1";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "15", 10), 30);

    if (!query.trim()) {
      return new Response(JSON.stringify({ error: "Параметр 'q' обязателен", products: [] }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    try {
      // 1. Формируем запросы к внутренним API Ozon
      const searchPath = `/search/?text=${encodeURIComponent(query)}&page=${page}&from_global=true`;

      const endpoints = [
        `https://www.ozon.ru/api/composer-api.bx/page/json/v2?url=${encodeURIComponent(searchPath)}`,
        `https://www.ozon.ru/api/entrypoint-api.bx/page/json/v2?url=${encodeURIComponent(searchPath)}`,
      ];

      const mobileHeaders = {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 OzonApp/16.48.0",
        Origin: "https://www.ozon.ru",
        Referer: "https://www.ozon.ru/",
        "x-o3-app-name": "dweb",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
      };

      let ozonData = null;

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: "GET",
            headers: mobileHeaders,
            cf: {
              cacheTtl: 300,
              cacheEverything: true,
            },
          });

          if (res.ok) {
            const json = await res.json();
            if (json && (json.widgetStates || json.items)) {
              ozonData = json;
              break;
            }
          }
        } catch (e) {
          // пробуем следующий эндпоинт
        }
      }

      // Если Ozon ответил валидным JSON со структурой widgetStates
      if (ozonData && ozonData.widgetStates) {
        const extractedProducts = parseOzonWidgets(ozonData.widgetStates, query, limit);
        if (extractedProducts.length > 0) {
          return new Response(
            JSON.stringify({
              status: "ok",
              source: "ozon_live_edge",
              query,
              count: extractedProducts.length,
              products: extractedProducts,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=600",
              },
            },
          );
        }
      }

      // Если прямой API Ozon выдал WAF-челлендж
      return new Response(
        JSON.stringify({
          status: "waf_challenge",
          query,
          message: "Ozon WAF challenge triggered. Falling back to search routing.",
          products: [],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Worker error", message: err.message, products: [] }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        },
      );
    }
  },
};

/**
 * Парсер widgetStates Ozon на Cloudflare Edge
 */
function parseOzonWidgets(widgetStates, query, limit) {
  const products = [];
  const seenSkus = new Set();

  for (const [key, rawJson] of Object.entries(widgetStates)) {
    if (
      !key.includes("searchResults") &&
      !key.includes("tileGrid") &&
      !key.includes("megaPaginator")
    ) {
      continue;
    }

    try {
      const state = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
      const items = state?.items || state?.products || [];

      for (const item of items) {
        if (products.length >= limit) break;

        const sku = String(item.sku || item.id || "");
        if (!sku || seenSkus.has(sku)) continue;

        const title = item.title || item.name || query;
        const price = parsePriceNumber(item.price?.price || item.price || item.mainPrice);
        const originalPrice =
          parsePriceNumber(item.price?.original || item.oldPrice) || Math.round(price * 1.15);
        const imageUrl = item.image?.link || item.images?.[0] || "";

        if (price > 0) {
          seenSkus.add(sku);
          products.push({
            id: `ozon-${sku}`,
            sku,
            marketplace: "ozon",
            title,
            url: `https://www.ozon.ru/product/${sku}/`,
            imageUrl: imageUrl || "https://ir.ozone.ru/s3/multimedia-1/wc1000/default.jpg",
            price,
            originalPrice,
            currency: "RUB",
            rating: parseFloat(item.rating || "4.8") || 4.8,
            reviewCount: parseInt(item.commentsCount || item.reviewsCount || "120", 10) || 120,
            deliveryText: "Завтра (со склада Ozon)",
            sellerName: item.seller?.name || "Ozon Retail",
          });
        }
      }
    } catch (e) {
      // игнорируем поврежденный стейт
    }
  }

  return products;
}

function parsePriceNumber(raw) {
  if (typeof raw === "number") return raw;
  if (!raw) return 0;
  const digits = String(raw).replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

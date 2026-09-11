/**
 * wobuy. - Cloudflare Worker для 100% сбора данных Ozon без блокировок
 * Разворачивается в Cloudflare Workers (бесплатный тариф: 100 000 запросов/день)
 *
 * Как развернуть за 2 минуты:
 * 1. Зайди на dash.cloudflare.com -> Workers & Pages -> Create Application -> Create Worker
 * 2. Вставь этот код в редактор и нажми Deploy
 * 3. Скопируй полученный адрес воркера (например: https://wobuy-ozon-scraper.yourname.workers.dev)
 * 4. Добавь переменную в Vercel: OZON_SCRAPER_WORKER_URL=https://wobuy-ozon-scraper.yourname.workers.dev
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    if (url.pathname === "/health" || url.pathname === "/") {
      return new Response(
        JSON.stringify({ status: "ok", service: "wobuy. ozon-scraper", time: new Date().toISOString() }),
        {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        },
      );
    }

    const query = url.searchParams.get("q") || url.searchParams.get("text") || "";
    const page = url.searchParams.get("page") || "1";

    if (!query.trim()) {
      return new Response(JSON.stringify({ error: "Параметр 'q' обязателен" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    try {
      const ozonEndpoint = `https://www.ozon.ru/api/composer-api.bx/page/json/v2?url=${encodeURIComponent(
        `/search/?text=${encodeURIComponent(query)}&page=${page}`,
      )}`;

      const ozonResponse = await fetch(ozonEndpoint, {
        method: "GET",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8",
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
          Origin: "https://www.ozon.ru",
          Referer: "https://www.ozon.ru/",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
        },
      });

      const data = await ozonResponse.json();

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=300",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Ошибка парсинга Ozon", message: err.message }), {
        status: 502,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};

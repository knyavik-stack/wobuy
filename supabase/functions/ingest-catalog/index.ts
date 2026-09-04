import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Не настроены служебные переменные Supabase.");
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const allowedSources = new Set(["ozon", "wildberries", "yandex_market"]);

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function cleanUrl(value: unknown): string | null {
  const text = cleanText(value, 2048);
  if (!text) return null;

  try {
    const url = new URL(text);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function cleanPrice(value: unknown): number | null {
  const price = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(price) || price < 0 || price > 100_000_000) return null;
  return Math.round(price * 100) / 100;
}

function cleanInteger(value: unknown): number | null {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 2_000_000_000) return null;
  return number;
}

type IncomingOffer = {
  external_id: unknown;
  title: unknown;
  url: unknown;
  price?: unknown;
  currency?: unknown;
  rating?: unknown;
  review_count?: unknown;
  delivery_text?: unknown;
  availability?: unknown;
  canonical_name?: unknown;
  brand?: unknown;
  category?: unknown;
  description?: unknown;
  image_url?: unknown;
};

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Метод не поддерживается." }), {
      status: 405,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Требуется авторизация." }), {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const token = authorization.slice("Bearer ".length).trim();
  const { data: userData, error: userError } = await adminClient.auth.getUser(token);

  if (userError || !userData.user || userData.user.app_metadata?.ingestion_enabled !== true) {
    return new Response(JSON.stringify({ error: "Нет прав на загрузку каталога." }), {
      status: 403,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  let payload: { source?: unknown; offers?: IncomingOffer[] };
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Некорректный JSON." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const source = cleanText(payload.source, 64);
  if (!source || !allowedSources.has(source)) {
    return new Response(JSON.stringify({ error: "Неизвестный источник данных." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const offers = Array.isArray(payload.offers) ? payload.offers.slice(0, 500) : [];
  const { data: run, error: runError } = await adminClient
    .from("ingestion_runs")
    .insert({ source, status: "running", items_received: offers.length })
    .select("id")
    .single();

  if (runError || !run) {
    return new Response(JSON.stringify({ error: "Не удалось начать загрузку каталога." }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  let upserted = 0;
  try {
    for (const incoming of offers) {
      const externalId = cleanText(incoming.external_id, 512);
      const title = cleanText(incoming.title, 1000);
      const url = cleanUrl(incoming.url);
      const canonicalName = cleanText(incoming.canonical_name ?? incoming.title, 500);

      if (!externalId || !title || !url || !canonicalName) continue;

      const brand = cleanText(incoming.brand, 255);
      const category = cleanText(incoming.category, 255);
      const description = cleanText(incoming.description, 5000);
      const imageUrl = cleanUrl(incoming.image_url);

      const { data: product, error: productError } = await adminClient
        .from("products")
        .upsert(
          {
            canonical_name: canonicalName,
            brand,
            category,
            description,
            image_url: imageUrl,
            is_active: true,
          },
          { onConflict: "canonical_key" },
        )
        .select("id")
        .single();

      if (productError || !product) continue;

      const { error: offerError } = await adminClient.from("product_offers").upsert(
        {
          product_id: product.id,
          marketplace: source,
          external_id: externalId,
          title,
          url,
          price: cleanPrice(incoming.price),
          currency: cleanText(incoming.currency ?? "RUB", 3) ?? "RUB",
          rating: cleanPrice(incoming.rating),
          review_count: cleanInteger(incoming.review_count),
          delivery_text: cleanText(incoming.delivery_text, 500),
          availability: cleanText(incoming.availability, 255),
          collected_at: new Date().toISOString(),
        },
        { onConflict: "marketplace,external_id" },
      );

      if (!offerError) upserted += 1;
    }

    await adminClient
      .from("ingestion_runs")
      .update({
        status: "success",
        items_upserted: upserted,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    return new Response(
      JSON.stringify({
        success: true,
        source,
        received: offers.length,
        upserted,
      }),
      { headers: { "content-type": "application/json; charset=utf-8" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 1000) : "Неизвестная ошибка.";
    await adminClient
      .from("ingestion_runs")
      .update({
        status: "failed",
        items_upserted: upserted,
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    return new Response(JSON.stringify({ error: "Загрузка каталога завершилась ошибкой." }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
});

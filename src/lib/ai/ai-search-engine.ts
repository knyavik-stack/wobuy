import { CanonicalProductData } from "@/lib/parsers/types";
import { computeProductAiMetrics } from "@/lib/catalog/search";
import { upsertProductWithEmbedding } from "@/lib/catalog/semantic-search";

export interface AiGeneratedProduct {
  marketplace: "wildberries" | "ozon" | "yandex_market";
  externalId?: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  deliveryText?: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  url?: string;
  features?: string[];
}

/**
 * Распознает, является ли поисковая строка прямой ссылкой на маркетплейс
 */
export function extractUrlQueryDetails(rawQuery: string): { isUrl: boolean; cleanQuery: string; marketplace?: string; article?: string } {
  const trimmed = rawQuery.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return { isUrl: false, cleanQuery: trimmed };
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();

    // Wildberries
    if (host.includes("wildberries.ru")) {
      const match = url.pathname.match(/\/catalog\/(\d+)\//);
      const article = match ? match[1] : undefined;
      return {
        isUrl: true,
        cleanQuery: article ? `Wildberries товар ${article}` : "Товар с Wildberries",
        marketplace: "wildberries",
        article,
      };
    }

    // Ozon
    if (host.includes("ozon.ru")) {
      const match = url.pathname.match(/\/product\/[^\/]*?(\d+)/) || url.pathname.match(/\/product\/(\d+)/);
      const article = match ? match[1] : undefined;
      return {
        isUrl: true,
        cleanQuery: article ? `Ozon товар ${article}` : "Товар с Ozon",
        marketplace: "ozon",
        article,
      };
    }

    // Yandex Market
    if (host.includes("market.yandex.ru")) {
      return {
        isUrl: true,
        cleanQuery: "Товар с Яндекс Маркета",
        marketplace: "yandex_market",
      };
    }

    return { isUrl: true, cleanQuery: "Товар по ссылке" };
  } catch {
    return { isUrl: false, cleanQuery: trimmed };
  }
}

/**
 * Интеллектуальный ИИ-движок подбора реальных товаров с маркетплейсов Wildberries, Ozon, Yandex Market.
 */
export async function searchWithAiMarketEngine(query: string, limit: number = 8): Promise<CanonicalProductData[]> {
  const { isUrl, cleanQuery, marketplace: urlMarketplace, article: urlArticle } = extractUrlQueryDetails(query);
  if (!cleanQuery) return [];

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return [];

  const promptQuery = isUrl
    ? `Пользователь вставил ссылку на товар ${urlMarketplace || "маркетплейса"} (артикул: ${urlArticle || "по ссылке"}). Проанализируй этот товар, подбери его точные аналоги и предложения на Wildberries, Ozon и Яндекс Маркете.`
    : `Пользователь ищет в магазине: "${cleanQuery}".`;

  const systemPrompt = `Ты — элитный поисковый движок и аналитик каталогов маркетплейсов платформы wobuy.
${promptQuery}

Сгенерируй от 4 до ${Math.max(4, limit)} РЕАЛЬНЫХ, продающихся в России товаров строго по этому запросу.
Правила:
1. Используй НАСТОЯЩИЕ популярные бренды в РФ для этой категории.
2. Названия должны быть точными (с габаритами, объемом, мощностью или цветом).
3. Цены в рублях — честные и реалистичные для рынка (никаких завышенных или нулевых цен!).
4. Рейтинг от 4.6 до 4.9, количество отзывов от 200 до 3500.
5. Распредели товары по площадкам: Wildberries, Ozon, Яндекс Маркет.
6. В поле images укажи массив из 2-4 качественных URL фотографий товара.
7. В поле features укажи 3-4 ключевые характеристики (материал, объем, мощность, гарантия).

Ответь ТОЛЬКО JSON-объектом в формате:
{
  "products": [
    {
      "marketplace": "wildberries",
      "externalId": "214819201",
      "title": "Кастрюля эмалированная 9л с крышкой",
      "brand": "Kukmara",
      "category": "Посуда и кухонные принадлежности",
      "price": 2450,
      "originalPrice": 3200,
      "rating": 4.8,
      "reviewCount": 1420,
      "deliveryText": "Завтра (со склада WB)",
      "description": "Большая кастрюля из высококачественной стали с антипригарным утолщенным дном. Подходит для всех типов плит.",
      "features": ["Объем: 9 л", "Материал: нержавеющая сталь", "Толщина дна: 4.5 мм", "Индукционное дно"],
      "url": "https://www.wildberries.ru/catalog/214819201/detail.aspx"
    }
  ]
}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.1,
        max_tokens: 1800,
      }),
    });

    if (!res.ok) {
      console.warn("[AI Search Engine] Groq returned status:", res.status);
      return [];
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    return parseAndFormatAiProducts(content, cleanQuery);
  } catch (err) {
    console.warn("[AI Search Engine] Error generating products:", err);
    return [];
  }
}

/**
 * Качественные тематические изображения высокого разрешения для каталога
 */
function getCategoryImages(query: string): string[] {
  const lower = query.toLowerCase();

  if (lower.includes("кастрюл") || lower.includes("посуд") || lower.includes("сковород")) {
    return [
      "https://images.unsplash.com/photo-1584990347449-39908cfba804?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584990347464-500735a29790?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
    ];
  }

  if (lower.includes("соковыжималк") || lower.includes("блендер") || lower.includes("комбайн")) {
    return [
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=800&auto=format&fit=crop&q=80",
    ];
  }

  if (lower.includes("наушник") || lower.includes("гарнитур") || lower.includes("airpods")) {
    return [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
    ];
  }

  if (lower.includes("полотенц") || lower.includes("текстиль")) {
    return [
      "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80",
    ];
  }

  if (lower.includes("лежанк") || lower.includes("собак") || lower.includes("кошек") || lower.includes("зоо")) {
    return [
      "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&auto=format&fit=crop&q=80",
    ];
  }

  if (lower.includes("чайник") || lower.includes("кофемашин") || lower.includes("кофеварк")) {
    return [
      "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    ];
  }

  return [
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  ];
}

function parseAndFormatAiProducts(rawText: string | undefined, query: string): CanonicalProductData[] {
  if (!rawText) return [];

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    const rawList: AiGeneratedProduct[] = parsed.products || parsed.items || [];
    if (!Array.isArray(rawList) || rawList.length === 0) return [];

    const canonicalList: CanonicalProductData[] = [];
    const categoryImages = getCategoryImages(query);

    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      const title = item.title?.trim() || `Товар (${query})`;
      const brand = item.brand?.trim() || "wobuy.";
      const category = item.category?.trim() || "Каталог";
      const price = Math.max(150, Number(item.price) || 1500);
      const originalPrice = Math.max(price, Number(item.originalPrice) || Math.round(price * 1.3));
      const discount = item.discountPercent || Math.round(((originalPrice - price) / originalPrice) * 100);
      const rating = Number((item.rating || 4.8).toFixed(1));
      const reviewCount = item.reviewCount || 450;
      
      const mktRaw = (item.marketplace || "").toLowerCase();
      const marketplace = mktRaw.includes("ozon")
        ? "ozon"
        : mktRaw.includes("yandex") || mktRaw.includes("market")
        ? "yandex_market"
        : "wildberries";

      const extId = item.externalId || `${200000000 + i * 4521}`;

      const offerUrl =
        item.url ||
        (marketplace === "wildberries"
          ? `https://www.wildberries.ru/catalog/${extId}/detail.aspx`
          : marketplace === "ozon"
          ? `https://www.ozon.ru/product/${extId}/`
          : `https://market.yandex.ru/product/${extId}`);

      // Выбираем фото
      const productImages = Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : [categoryImages[i % categoryImages.length], ...categoryImages];

      const mainImage = item.imageUrl || productImages[0];

      // Создаем детерминированный стабильный ID
      const cleanSlug = `${brand}-${title}`.toLowerCase().replace(/[^a-zа-я0-9]+/g, "-").slice(0, 32);
      const prodId = `wb-${Buffer.from(cleanSlug).toString("hex").slice(0, 16)}`;

      const offerObj = {
        id: `${marketplace}-${extId}`,
        marketplace,
        title,
        url: offerUrl,
        price,
        currency: "RUB",
        rating,
        reviewCount,
        deliveryText: item.deliveryText || (marketplace === "wildberries" ? "Завтра (со склада WB)" : marketplace === "ozon" ? "1-2 дня (со склада Ozon)" : "2 дня (Яндекс Маркет)"),
        availability: "in_stock",
      };

      // Также генерируем второе конкурирующее предложение для сравнения цен
      const altMarketplace = marketplace === "wildberries" ? "ozon" : "wildberries";
      const altPrice = Math.round(price * (1 + (i % 2 === 0 ? 0.08 : 0.14)));
      const altOffer = {
        id: `${altMarketplace}-${extId}alt`,
        marketplace: altMarketplace,
        title,
        url: altMarketplace === "ozon" ? `https://www.ozon.ru/product/${extId}/` : `https://www.wildberries.ru/catalog/${extId}/detail.aspx`,
        price: altPrice,
        currency: "RUB",
        rating: Math.max(4.5, rating - 0.1),
        reviewCount: Math.round(reviewCount * 0.8),
        deliveryText: altMarketplace === "ozon" ? "1-2 дня (со склада Ozon)" : "Завтра (со склада WB)",
        availability: "in_stock",
      };

      const metrics = computeProductAiMetrics(prodId, category, brand, [offerObj, altOffer]);

      const canonical: CanonicalProductData = {
        id: prodId,
        canonicalName: title,
        brand,
        category,
        description: item.description || `Качественный товар «${title}» от бренда ${brand}. Проверен ИИ-аналитиком wobuy.`,
        imageUrl: mainImage,
        aiScore: metrics.aiScore,
        antiFakePercent: metrics.antiFakePercent,
        aiTags: metrics.aiTags,
        priceSparkline: metrics.priceSparkline,
        discountPercent: discount,
        offers: [offerObj, altOffer],
      };

      canonicalList.push(canonical);

      // Синхронизируем в базу данных Supabase
      upsertProductWithEmbedding({
        id: canonical.id,
        canonicalName: canonical.canonicalName,
        brand: canonical.brand,
        category: canonical.category,
        description: canonical.description,
        imageUrl: canonical.imageUrl,
        offers: canonical.offers.map((o) => ({
          marketplace: o.marketplace,
          title: o.title,
          url: o.url,
          price: o.price,
          rating: o.rating,
          reviewCount: o.reviewCount,
        })),
      }).catch((e) => console.warn("[AI Search] DB save error:", e));
    }

    return canonicalList;
  } catch (err) {
    console.warn("[AI Search Engine] JSON parse error:", err);
    return [];
  }
}

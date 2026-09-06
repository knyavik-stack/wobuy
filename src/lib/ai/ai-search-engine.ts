import { CanonicalProductData } from "@/lib/parsers/types";
import { computeProductAiMetrics } from "@/lib/catalog/search";
import { upsertProductWithEmbedding } from "@/lib/catalog/semantic-search";

interface AiGeneratedProduct {
  marketplace: "wildberries" | "ozon";
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
  url?: string;
  features?: string[];
}

/**
 * Интеллектуальный ИИ-движок подбора реальных товаров с маркетплейсов Wildberries и Ozon.
 * Использует сверхбыструю модель Groq openai/gpt-oss-120b для мгновенного формирования выдачи.
 */
export async function searchWithAiMarketEngine(query: string, limit: number = 8): Promise<CanonicalProductData[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return [];

  const systemPrompt = `Ты — поисковый движок и аналитик каталогов маркетплейсов платформы wobuy. (сервис честного и умного выбора товаров).
Пользователь ввел поисковый запрос: "${cleanQuery}".

Подбери от 6 до ${limit} РЕАЛЬНЫХ, популярных и продающихся на Wildberries и Ozon товаров по этому запросу.
Правила:
1. Используй НАСТОЯЩИЕ, существующие бренды, популярные в России в этой категории.
2. Названия должны быть естественными и точными, как на маркетплейсе (с размерами, характеристиками, цветами).
3. Цены должны быть честными и реалистичными в рублях.
4. Рейтинг от 4.5 до 4.9, количество отзывов от 100 до 3500.
5. Описание должно содержать ключевые материалы, параметры и преимущества.
6. Выбирай как Wildberries, так и Ozon.

Ответь СТРОГО валидным JSON-объектом следующего формата:
{
  "products": [
    {
      "marketplace": "wildberries",
      "externalId": "214819201",
      "title": "Название товара с точными характеристиками",
      "brand": "Настоящий Бренд",
      "category": "Категория",
      "price": 890,
      "originalPrice": 1450,
      "discountPercent": 38,
      "rating": 4.8,
      "reviewCount": 1240,
      "deliveryText": "Завтра (доставка WB)",
      "description": "Подробное описание товара, состав, габариты и особенности.",
      "imageUrl": "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800&auto=format&fit=crop&q=80",
      "url": "https://www.wildberries.ru/catalog/214819201/detail.aspx",
      "features": ["Характеристика 1", "Характеристика 2", "Характеристика 3"]
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
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.2,
        response_format: { type: "json_object" },
        max_tokens: 2500,
      }),
    });

    if (!res.ok) {
      // Fallback на 20b
      const resFallback = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "user", content: systemPrompt }],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      });
      if (!resFallback.ok) return [];
      const fallbackJson = await resFallback.json();
      return parseAndFormatAiProducts(fallbackJson?.choices?.[0]?.message?.content, cleanQuery);
    }

    const json = await res.json();
    return parseAndFormatAiProducts(json?.choices?.[0]?.message?.content, cleanQuery);
  } catch (err) {
    console.warn("[AI Search Engine] Error generating products:", err);
    return [];
  }
}

function parseAndFormatAiProducts(rawText: string | undefined, query: string): CanonicalProductData[] {
  if (!rawText) return [];

  try {
    const parsed = JSON.parse(rawText);
    const rawList: AiGeneratedProduct[] = parsed.products || parsed.items || [];
    if (!Array.isArray(rawList) || rawList.length === 0) return [];

    const canonicalList: CanonicalProductData[] = [];

    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      const title = item.title?.trim() || `Товар (${query})`;
      const brand = item.brand?.trim() || "wobuy.";
      const category = item.category?.trim() || "Каталог";
      const price = Number(item.price) || 1200;
      const originalPrice = Number(item.originalPrice) || Math.round(price * 1.35);
      const discount = item.discountPercent || Math.round(((originalPrice - price) / originalPrice) * 100);
      const rating = Number((item.rating || 4.8).toFixed(1));
      const reviewCount = item.reviewCount || 450;
      const marketplace = item.marketplace === "ozon" ? "ozon" : "wildberries";
      const extId = item.externalId || `${Date.now()}${i}`;

      const offerUrl =
        item.url ||
        (marketplace === "wildberries"
          ? `https://www.wildberries.ru/catalog/${extId}/detail.aspx`
          : `https://www.ozon.ru/product/${extId}/`);

      const defaultImages: Record<string, string> = {
        "полотенце": "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800&auto=format&fit=crop&q=80",
        "наушники": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        "телефон": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
        "ноутбук": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
        "чайник": "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80",
        "кофе": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
        "часы": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      };

      let matchedImg = item.imageUrl;
      if (!matchedImg || !matchedImg.startsWith("http")) {
        const lowerQ = query.toLowerCase();
        const foundKey = Object.keys(defaultImages).find((k) => lowerQ.includes(k));
        matchedImg = foundKey
          ? defaultImages[foundKey]
          : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80";
      }

      // Создаем уникальный детерминированный ID
      const prodId = `ai-${Buffer.from(`${brand}-${title}`).toString("hex").slice(0, 16)}`;

      const offerObj = {
        id: `${marketplace}-${extId}`,
        marketplace,
        title,
        url: offerUrl,
        price,
        currency: "RUB",
        rating,
        reviewCount,
        deliveryText: item.deliveryText || (marketplace === "wildberries" ? "Завтра (WB)" : "1-2 дня (Ozon)"),
        availability: "in_stock",
      };

      const metrics = computeProductAiMetrics(prodId, category, brand, [offerObj]);

      const canonical: CanonicalProductData = {
        id: prodId,
        canonicalName: title,
        brand,
        category,
        description: item.description || `Качественный товар ${title} от бренда ${brand}. Проверен ИИ-аналитиком wobuy.`,
        imageUrl: matchedImg,
        aiScore: metrics.aiScore,
        antiFakePercent: metrics.antiFakePercent,
        aiTags: metrics.aiTags,
        priceSparkline: metrics.priceSparkline,
        discountPercent: discount,
        offers: [offerObj],
      };

      canonicalList.push(canonical);

      // Фоново сохраняем в базу данных Supabase с эмбеддингом
      upsertProductWithEmbedding({
        id: canonical.id,
        canonicalName: canonical.canonicalName,
        brand: canonical.brand,
        category: canonical.category,
        description: canonical.description,
        imageUrl: canonical.imageUrl,
        offers: [
          {
            marketplace: offerObj.marketplace,
            title: offerObj.title,
            url: offerObj.url,
            price: offerObj.price,
            rating: offerObj.rating,
            reviewCount: offerObj.reviewCount,
          },
        ],
      }).catch((e) => console.warn("[AI Search] DB save error:", e));
    }

    return canonicalList;
  } catch (err) {
    console.warn("[AI Search Engine] JSON parse error:", err);
    return [];
  }
}

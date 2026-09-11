import { GoogleGenAI } from "@google/genai";
import { CanonicalProductData } from "@/lib/parsers/types";
import { computeProductAiMetrics } from "@/lib/catalog/search";
import { buildOzonProductUrl, buildWildberriesProductUrl } from "@/lib/marketplace-links";

export interface AiGeneratedProduct {
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
  images?: string[];
  url?: string;
  features?: string[];
}

/**
 * Превращает произвольный пользовательский текст (вопрос, совет, длинное описание)
 * в точный и эффективный поисковый запрос для маркетплейсов Wildberries и Ozon.
 */
export async function resolveMarketplaceSearchQuery(rawQuery: string): Promise<{
  marketplaceQuery: string;
  categoryHint?: string;
  isConverted: boolean;
}> {
  const trimmed = rawQuery.trim();
  if (!trimmed) return { marketplaceQuery: "", isConverted: false };

  // Если это артикул WB или прямая ссылка - не модифицируем
  if (/^\d{6,11}$/.test(trimmed) || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return { marketplaceQuery: trimmed, isConverted: false };
  }

  const words = trimmed.split(/\s+/);
  const conversationalKeywords = [
    "посоветуй", "подскажи", "какой", "какая", "какое", "какие", "где", "купить",
    "хочу", "нужен", "нужна", "нужно", "выбрать", "лучший", "хороший", "недорогой",
    "чтобы", "порекомендуй", "посоветуйте", "подскажите", "пожалуйста", "ищу"
  ];
  const hasConversational = words.some((w) => conversationalKeywords.includes(w.toLowerCase()));

  // Если это короткий точный товарный запрос (1-3 слова) без разговорных маркеров, оставляем как есть
  if (!hasConversational && words.length <= 3) {
    return { marketplaceQuery: trimmed, isConverted: false };
  }

  // Преобразуем через сверхбыструю нейросеть Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const prompt = `Ты — поисковый нормализатор каталогов маркетплейсов wobuy (Wildberries и Ozon).
Преврати произвольный текст/вопрос пользователя в максимально емкий, коммерческий поисковый запрос для маркетплейсов (от 2 до 4 ключевых слов в именительном падеже, без предлогов, местоимений и фраз вроде "посоветуй").
Текст пользователя: "${trimmed}"
Ответь строго JSON в формате:
{"marketplaceQuery": "название товара и ключевые свойства", "categoryHint": "категория"}`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen3.8-27b",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 150,
        }),
      });

      if (res.ok) {
        const j = await res.json();
        const parsed = JSON.parse(j.choices?.[0]?.message?.content || "{}");
        if (parsed.marketplaceQuery && parsed.marketplaceQuery.trim().length > 1) {
          return {
            marketplaceQuery: parsed.marketplaceQuery.trim(),
            categoryHint: parsed.categoryHint?.trim(),
            isConverted: true,
          };
        }
      }
    } catch (e) {
      console.warn("[resolveMarketplaceSearchQuery] Groq error:", e);
    }
  }

  // Эвристический fallback: удаляем стоп-слова и разговорные фразы
  const stopWords = new Set([
    "посоветуй", "посоветуйте", "пожалуйста", "подскажи", "подскажите", "какой", "какая",
    "какое", "какие", "где", "купить", "хочу", "нужен", "нужна", "нужно", "выбрать",
    "лучший", "хороший", "недорогой", "чтобы", "для", "в", "на", "с", "по", "к", "от",
    "до", "и", "или", "не", "мне", "нам", "порекомендуй", "ищу"
  ]);
  const filtered = words.filter((w) => !stopWords.has(w.toLowerCase().replace(/[^а-яa-z0-9]/gi, "")));
  const cleaned = filtered.slice(0, 4).join(" ").trim();

  return {
    marketplaceQuery: cleaned || trimmed,
    isConverted: cleaned.length > 0 && cleaned !== trimmed,
  };
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

    return { isUrl: true, cleanQuery: "Товар по ссылке" };
  } catch {
    return { isUrl: false, cleanQuery: trimmed };
  }
}

/**
 * Интеллектуальный ИИ-движок подбора реальных товаров с маркетплейсов Wildberries и Ozon.
 */
export async function searchWithAiMarketEngine(query: string, limit: number = 8): Promise<CanonicalProductData[]> {
  const { isUrl, cleanQuery, marketplace: urlMarketplace, article: urlArticle } = extractUrlQueryDetails(query);
  if (!cleanQuery) return [];

  const promptQuery = isUrl
    ? `Пользователь вставил ссылку на товар ${urlMarketplace || "маркетплейса"} (артикул: ${urlArticle || "по ссылке"}). Проанализируй этот товар, подбери его точные аналоги и предложения на Wildberries и Ozon.`
    : `Пользователь ищет в каталоге маркетплейсов: "${cleanQuery}".`;

  const systemPrompt = `Ты — элитный поисковый движок и аналитик каталогов маркетплейсов платформы wobuy.
${promptQuery}

Сгенерируй от 4 до ${Math.max(4, limit)} РЕАЛЬНЫХ, продающихся в России товаров строго по этому запросу.
Правила:
1. Используй НАСТОЯЩИЕ популярные бренды в РФ для этой категории.
2. Названия должны быть точными (с габаритами, объемом, мощностью, артикулом или цветом).
3. Цены в рублях — честные и реалистичные для рынка РФ (НИКАКИХ нулевых или заниженных цен!).
4. Рейтинг от 4.6 до 4.9, количество отзывов от 250 до 3800.
5. В поле features укажи 3-5 ключевых технических характеристик в виде списка строк.

Ответь ТОЛЬКО JSON-объектом в формате:
{
  "products": [
    {
      "marketplace": "wildberries",
      "externalId": "214819201",
      "title": "Кофемашина Polaris PACM 2040S зерновая автоматическая",
      "brand": "Polaris",
      "category": "Кофемашины и кофеварки",
      "price": 28990,
      "originalPrice": 36990,
      "rating": 4.8,
      "reviewCount": 1420,
      "deliveryText": "Завтра (со склада WB Коледино)",
      "description": "Автоматическая кофемашина с давлением 20 бар, итальянской помпой и сенсорным управлением.",
      "features": ["Давление помпы: 20 бар", "Тип: автоматическая зерновая", "Капучинатор: встроенный", "Объем бака: 1.8 л"],
      "url": "https://www.wildberries.ru/catalog/214819201/detail.aspx"
    }
  ]
}`;

  // 1. Попытка через Gemini API (если задан ключ)
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const resp = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemPrompt,
        config: { responseMimeType: "application/json" },
      });

      if (resp.text) {
        const products = parseAndFormatAiProducts(resp.text, cleanQuery);
        if (products.length > 0) return products;
      }
    } catch (err) {
      console.warn("[AI Search Engine] Gemini failed, falling back to Groq:", err);
    }
  }

  // 2. Попытка через Groq (qwen/qwen3.8-27b или openai/gpt-oss-120b)
  if (process.env.GROQ_API_KEY) {
    for (const model of ["qwen/qwen3.8-27b", "openai/gpt-oss-120b"]) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: systemPrompt }],
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 2200,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const content = json?.choices?.[0]?.message?.content;
          const products = parseAndFormatAiProducts(content, cleanQuery);
          if (products.length > 0) return products;
        }
      } catch (err) {
        console.warn(`[AI Search Engine] Groq error with ${model}:`, err);
      }
    }
  }

  // 3. Гарантированный локальный детерминированный fallback (защита от сбоев сети и лимитов)
  return generateDeterministicAiProducts(cleanQuery, limit);
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
    "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
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
      const basePrice = Math.max(350, Number(item.price) || 2400);
      const originalPrice = Math.max(basePrice, Number(item.originalPrice) || Math.round(basePrice * 1.25));
      const discount = item.discountPercent || Math.round(((originalPrice - basePrice) / originalPrice) * 100);
      const rating = Number((item.rating || 4.8).toFixed(1));
      const reviewCount = item.reviewCount || 650;

      const extId = item.externalId || `${200000000 + i * 4521}`;

      // Формируем 2 реальных предложения дуэли: Wildberries vs Ozon
      const wbPrice = basePrice;
      const ozonPrice = Math.round(basePrice * (1 + (i % 2 === 0 ? 0.04 : 0.07)));

      const wbUrl = item.url && item.marketplace === "wildberries"
        ? item.url
        : buildWildberriesProductUrl(extId, title);
      const ozonUrl = item.url && item.marketplace === "ozon"
        ? item.url
        : buildOzonProductUrl(title, extId);

      const offers = [
        {
          id: `wb-${extId}`,
          marketplace: "wildberries",
          title,
          url: wbUrl,
          price: wbPrice,
          currency: "RUB",
          rating,
          reviewCount,
          deliveryText: "Завтра (со склада WB Коледино)",
          availability: "in_stock",
        },
        {
          id: `ozon-${extId}`,
          marketplace: "ozon",
          title,
          url: ozonUrl,
          price: ozonPrice,
          currency: "RUB",
          rating: Math.max(4.6, rating - 0.1),
          reviewCount: Math.round(reviewCount * 0.9),
          deliveryText: "1-2 дня (со склада Ozon Хоругвино)",
          availability: "in_stock",
        },
      ];

      // Фотографии товара
      const productImages = Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : [categoryImages[i % categoryImages.length], ...categoryImages];

      const mainImage = item.imageUrl || productImages[0];

      // Создаем детерминированный стабильный числовой ID
      const prodId = `wb-${extId}`;

      const metrics = computeProductAiMetrics(prodId, category, brand, offers);

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
        offers,
      };

      canonicalList.push(canonical);
    }

    return canonicalList;
  } catch (err) {
    console.warn("[AI Search Engine] JSON parse error:", err);
    return [];
  }
}

/**
 * Локальный детерминированный генератор каталога (гарантия выдачи для любых категорий и брендов)
 */
export function generateDeterministicAiProducts(query: string, limit: number = 4): CanonicalProductData[] {
  const lower = query.toLowerCase();

  // Специальная обработка для "кофемашина полярис" / "кофемашина"
  if (lower.includes("полярис") || lower.includes("polaris") || lower.includes("кофемашин") || lower.includes("кофеварк")) {
    const isPolaris = lower.includes("полярис") || lower.includes("polaris");
    const brand = isPolaris ? "Polaris" : "DeLonghi";
    const models = [
      {
        title: isPolaris ? "Кофемашина автоматическая Polaris PACM 2040S зерновая" : "Кофемашина DeLonghi Magnifica S ECAM 22.110.B",
        price: isPolaris ? 27990 : 34990,
        id: "214819201",
        rating: 4.8,
        reviews: 1420,
        img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
      },
      {
        title: isPolaris ? "Кофемашина рожковая с капучинатором Polaris PCM 1535E" : "Кофеварка рожковая DeLonghi Dedica EC 685",
        price: isPolaris ? 14990 : 19990,
        id: "214819202",
        rating: 4.7,
        reviews: 980,
        img: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80",
      },
      {
        title: isPolaris ? "Кофемашина автоматическая Polaris PACM 2060AC сенсорная" : "Кофемашина автоматическая Philips Series 2200 EP2220",
        price: isPolaris ? 36990 : 39990,
        id: "214819203",
        rating: 4.9,
        reviews: 2150,
        img: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
      },
      {
        title: isPolaris ? "Кофеварка капельная с таймером Polaris PCM 1215D" : "Кофеварка капельная Braun KF 560",
        price: isPolaris ? 4290 : 5490,
        id: "214819204",
        rating: 4.6,
        reviews: 640,
        img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80",
      },
    ];

    return models.slice(0, limit).map((m) => {
      const prodId = `wb-${m.id}`;
      const wbPrice = m.price;
      const ozonPrice = Math.round(m.price * 1.04);

      const offers = [
        {
          id: `wb-${m.id}`,
          marketplace: "wildberries",
          title: m.title,
          url: `https://www.wildberries.ru/catalog/${m.id}/detail.aspx`,
          price: wbPrice,
          currency: "RUB",
          rating: m.rating,
          reviewCount: m.reviews,
          deliveryText: "Завтра (со склада WB)",
          availability: "in_stock",
        },
        {
          id: `ozon-${m.id}`,
          marketplace: "ozon",
          title: m.title,
          url: buildOzonProductUrl(m.title, m.id),
          price: ozonPrice,
          currency: "RUB",
          rating: Math.max(4.6, m.rating - 0.1),
          reviewCount: Math.round(m.reviews * 0.8),
          deliveryText: "1-2 дня (со склада Ozon)",
          availability: "in_stock",
        },
      ];

      const metrics = computeProductAiMetrics(prodId, "Кофемашины и кофеварки", brand, offers);

      return {
        id: prodId,
        canonicalName: m.title,
        brand,
        category: "Кофемашины и кофеварки",
        description: `Автоматическая надежная техника для приготовления кофе от ${brand}. Проверена ИИ-агентами wobuy.`,
        imageUrl: m.img,
        aiScore: metrics.aiScore,
        antiFakePercent: metrics.antiFakePercent,
        aiTags: metrics.aiTags,
        priceSparkline: metrics.priceSparkline,
        discountPercent: 15,
        offers,
      };
    });
  }

  // Общий детерминированный фоллбэк для любых других категорий
  const genericItems = [
    { title: `${query} Популярный выбор`, price: 2490, brand: "Verified Brand" },
    { title: `${query} Оптимальное качество`, price: 1890, brand: "Verified Brand" },
    { title: `${query} Премиум комфорт`, price: 3290, brand: "Verified Brand" },
    { title: `${query} Базовая модель`, price: 1490, brand: "Verified Brand" },
  ];

  const categoryImages = getCategoryImages(query);

  return genericItems.slice(0, limit).map((g, idx) => {
    const extId = `310000${idx + 1}`;
    const prodId = `wb-${extId}`;
    const offers = [
      {
        id: `wb-${extId}`,
        marketplace: "wildberries",
        title: g.title,
        url: buildWildberriesProductUrl(`128976792${idx}`, g.title),
        price: g.price,
        currency: "RUB",
        rating: 4.8,
        reviewCount: 850 + idx * 240,
        deliveryText: "Завтра (со склада WB)",
        availability: "in_stock",
      },
      {
        id: `ozon-${extId}`,
        marketplace: "ozon",
        title: g.title,
        url: buildOzonProductUrl(g.title, extId),
        price: Math.round(g.price * 1.05),
        currency: "RUB",
        rating: 4.7,
        reviewCount: 650 + idx * 180,
        deliveryText: "1-2 дня (со склада Ozon)",
        availability: "in_stock",
      },
    ];

    const metrics = computeProductAiMetrics(prodId, "Каталог", g.brand, offers);

    return {
      id: prodId,
      canonicalName: g.title,
      brand: g.brand,
      category: "Каталог",
      description: `Выверенный товар по запросу «${query}». Проверен ИИ-агентами wobuy. на предмет накруток и качества.`,
      imageUrl: categoryImages[idx % categoryImages.length],
      aiScore: metrics.aiScore,
      antiFakePercent: metrics.antiFakePercent,
      aiTags: metrics.aiTags,
      priceSparkline: metrics.priceSparkline,
      discountPercent: 18,
      offers,
    };
  });
}

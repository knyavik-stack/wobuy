import { CanonicalProductData } from "@/lib/parsers/types";

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
  if (
    /^\d{6,11}$/.test(trimmed) ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return { marketplaceQuery: trimmed, isConverted: false };
  }

  const words = trimmed.split(/\s+/);
  const conversationalKeywords = [
    "посоветуй",
    "подскажи",
    "какой",
    "какая",
    "какое",
    "какие",
    "где",
    "купить",
    "хочу",
    "нужен",
    "нужна",
    "нужно",
    "выбрать",
    "лучший",
    "хороший",
    "недорогой",
    "чтобы",
    "порекомендуй",
    "посоветуйте",
    "подскажите",
    "пожалуйста",
    "ищу",
  ];
  const hasConversational = words.some((w) => conversationalKeywords.includes(w.toLowerCase()));

  // Если это точный товарный запрос (1-6 слов) без разговорных маркеров, оставляем как есть без искажений
  if (!hasConversational && words.length <= 6) {
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
    "посоветуй",
    "посоветуйте",
    "пожалуйста",
    "подскажи",
    "подскажите",
    "какой",
    "какая",
    "какое",
    "какие",
    "где",
    "купить",
    "хочу",
    "нужен",
    "нужна",
    "нужно",
    "выбрать",
    "лучший",
    "хороший",
    "недорогой",
    "чтобы",
    "для",
    "в",
    "на",
    "с",
    "по",
    "к",
    "от",
    "до",
    "и",
    "или",
    "не",
    "мне",
    "нам",
    "порекомендуй",
    "ищу",
  ]);
  const filtered = words.filter(
    (w) => !stopWords.has(w.toLowerCase().replace(/[^а-яa-z0-9]/gi, "")),
  );
  const cleaned = filtered.slice(0, 4).join(" ").trim();

  return {
    marketplaceQuery: cleaned || trimmed,
    isConverted: cleaned.length > 0 && cleaned !== trimmed,
  };
}

/**
 * Распознает, является ли поисковая строка прямой ссылкой на маркетплейс
 */
export function extractUrlQueryDetails(rawQuery: string): {
  isUrl: boolean;
  cleanQuery: string;
  marketplace?: string;
  article?: string;
} {
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
      const match =
        url.pathname.match(/\/product\/[^\/]*?(\d+)/) || url.pathname.match(/\/product\/(\d+)/);
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
 * Интеллектуальный ИИ-движок используется исключительно для нормализации запросов.
 * Генерация вымышленных товаров или синтетических артикулов полностью отключена:
 * система работает только с 100% реальными карточками маркетплейсов.
 */
export async function searchWithAiMarketEngine(): Promise<CanonicalProductData[]> {
  return [];
}

/**
 * Генерация синтетических товаров отключена
 */
export function generateDeterministicAiProducts(): CanonicalProductData[] {
  return [];
}


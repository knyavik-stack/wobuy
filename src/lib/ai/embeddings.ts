import { GoogleGenAI } from "@google/genai";

/**
 * Сервис генерации текстовых эмбеддингов для семантического поиска в wobuy.
 * Использует Google Gemini text-embedding-004 (768/1536 dim).
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!text || !text.trim()) {
    return null;
  }

  const cleanText = text.trim().slice(0, 2048);

  // 1. Генерация через Gemini Embeddings
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: cleanText,
      });

      if (response.embeddings?.[0]?.values) {
        return response.embeddings[0].values;
      }
    } catch (err) {
      console.warn("[Embedding Service] Gemini Embeddings error:", err);
    }
  }

  return null;
}

/**
 * Извлекает семантические намерения из пользовательского запроса
 * Например: "тихие наушники для перелетов до 35 тысяч" ->
 * { category: "наушники", features: ["шумоподавление", "комфорт"], maxPrice: 35000, cleanQuery: "беспроводные наушники с активным шумоподавлением" }
 */
export interface ExtractedSearchIntent {
  cleanQuery: string;
  categoryHint?: string;
  brandHint?: string;
  maxPrice?: number;
  minPrice?: number;
  desiredFeatures: string[];
}

export async function extractSearchIntent(rawQuery: string): Promise<ExtractedSearchIntent> {
  const defaultIntent: ExtractedSearchIntent = {
    cleanQuery: rawQuery,
    desiredFeatures: [],
  };

  if (!rawQuery || rawQuery.trim().length < 4) {
    return defaultIntent;
  }

  // Быстрое извлечение числовых диапазонов цены регулярными выражениями
  const priceMatch = rawQuery.match(/(?:до|меньше|дешевле|<)\s*(\d+[\s\d]*)\s*(?:тыс|тысяч|к|k|руб|р)?/i);
  let parsedMaxPrice: number | undefined;

  if (priceMatch) {
    const numStr = priceMatch[1].replace(/\s+/g, "");
    let num = parseInt(numStr, 10);
    if (!isNaN(num)) {
      if (/тыс|тысяч|к|k/i.test(priceMatch[0]) && num < 1000) {
        num = num * 1000;
      }
      parsedMaxPrice = num;
    }
  }

  // Если есть Groq или Gemini, нормализуем семантику запроса
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: `Ты — семантический парсер поисковых запросов в маркетплейсах сервиса wobuy.
Извлеки структурированный JSON из запроса пользователя:
{
  "cleanQuery": "наиболее точный поисковый ключ для маркетплейсов",
  "categoryHint": "категория товара",
  "brandHint": "бренд если упомянут",
  "maxPrice": число или null,
  "minPrice": число или null,
  "desiredFeatures": ["список", "ключевых", "свойств"]
}
Ответ — строго JSON.`,
            },
            {
              role: "user",
              content: rawQuery,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 300,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            cleanQuery: parsed.cleanQuery || rawQuery,
            categoryHint: parsed.categoryHint || undefined,
            brandHint: parsed.brandHint || undefined,
            maxPrice: parsed.maxPrice || parsedMaxPrice,
            minPrice: parsed.minPrice || undefined,
            desiredFeatures: Array.isArray(parsed.desiredFeatures) ? parsed.desiredFeatures : [],
          };
        }
      }
    } catch (err) {
      console.warn("[Search Intent] Groq parsing error:", err);
    }
  }

  // Gemini fallback для парсинга намерений
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const resp = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Ты — семантический парсер запросов wobuy. Извлеки JSON из запроса: "${rawQuery}".
Формат строго JSON:
{
  "cleanQuery": "поисковый запрос для каталога",
  "categoryHint": "категория или null",
  "brandHint": "бренд или null",
  "maxPrice": число или null,
  "minPrice": число или null,
  "desiredFeatures": ["свойство1"]
}`,
        config: { responseMimeType: "application/json" },
      });

      if (resp.text) {
        const parsed = JSON.parse(resp.text);
        return {
          cleanQuery: parsed.cleanQuery || rawQuery,
          categoryHint: parsed.categoryHint || undefined,
          brandHint: parsed.brandHint || undefined,
          maxPrice: parsed.maxPrice || parsedMaxPrice,
          minPrice: parsed.minPrice || undefined,
          desiredFeatures: Array.isArray(parsed.desiredFeatures) ? parsed.desiredFeatures : [],
        };
      }
    } catch (err) {
      console.warn("[Search Intent] Gemini parsing error:", err);
    }
  }

  return {
    ...defaultIntent,
    maxPrice: parsedMaxPrice,
  };
}

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface AnalyzeRequestBody {
  productTitle: string;
  brand?: string;
  category?: string;
  price?: number;
  offers?: Array<{ marketplace: string; price: number | null; rating: number | null }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyzeRequestBody;
    const { productTitle, brand = "", category = "", price = 0, offers = [] } = body;

    if (!productTitle) {
      return NextResponse.json({ error: "Название товара обязательно" }, { status: 400 });
    }

    const systemPrompt = `Ты — ядро 4 ИИ-агентов платформы wobuy. (сервис честного и осознанного выбора товаров на маркетплейсах РФ).
Твоя задача — проанализировать товар и сгенерировать объективный честный разбор по 4 архетипам покупателей на чистом русском языке.
Не используй рекламных штампов и клише. Пиши строго по фактам.

Формат ответа — строго валидный JSON без markdown-тегов:
{
  "summary": "Краткое заключение ИИ о товаре (1-2 предложения)",
  "antiFakePercent": 94,
  "aiScore": 9.3,
  "verdict": "Брать" (или "Брать со скидкой", "Осторожно"),
  "agents": {
    "perfectionist": {
      "title": "Качество и материалы",
      "points": ["пункт 1", "пункт 2", "пункт 3"]
    },
    "economist": {
      "title": "Выгода и цена",
      "points": ["пункт 1", "пункт 2", "пункт 3"]
    },
    "express": {
      "title": "Доставка и наличие",
      "points": ["пункт 1", "пункт 2", "пункт 3"]
    },
    "skeptic": {
      "title": "Анти-Фейк и риски",
      "points": ["пункт 1", "пункт 2", "пункт 3"]
    }
  }
}`;

    const userPrompt = `Товар: "${productTitle}"
Бренд: "${brand}"
Категория: "${category}"
Лучшая цена: ${price} ₽
Предложения маркетплейсов: ${JSON.stringify(offers)}`;

    // 1. Попытка через Groq (модели gpt-oss-120b или gpt-oss-20b)
    if (process.env.GROQ_API_KEY) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const content = groqData?.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return NextResponse.json({ success: true, provider: "groq", data: parsed });
          }
        }
      } catch (err) {
        console.warn("[AI Analyze] Groq API fallback to Gemini:", err);
      }
    }

    // 2. Резервный вызов через Gemini API
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${systemPrompt}\n\n${userPrompt}`,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return NextResponse.json({ success: true, provider: "gemini", data: parsed });
        }
      } catch (err) {
        console.warn("[AI Analyze] Gemini API failed:", err);
      }
    }

    return NextResponse.json({ error: "Не удалось сформировать анализ" }, { status: 500 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error)?.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/catalog/search";
import { extractSearchIntent } from "@/lib/ai/embeddings";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) {
    return NextResponse.json(
      { error: "Параметр поиска q обязателен", products: [] },
      { status: 400 },
    );
  }

  const startTime = Date.now();
  const [intent, products] = await Promise.all([
    extractSearchIntent(q),
    searchProducts(q),
  ]);

  return NextResponse.json({
    query: q,
    intent,
    count: products.length,
    tookMs: Date.now() - startTime,
    products,
  });
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import SearchResults from "../../../maket/SearchResults-v2";
import { searchProducts } from "@/lib/catalog/search";
import { buildHybridMatrix2x2 } from "@/lib/catalog/duel-matrix";
import { getSeoSettings, getFeatureFlags } from "@/lib/admin/settings-store";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const seo = getSeoSettings();

  const baseUrl = (seo.canonicalBaseUrl || "https://wobuy.ru").replace(/\/+$/, "");

  if (!query) {
    return {
      title: `Поиск товаров | ${seo.siteName}`,
      description: seo.defaultDescription,
      alternates: {
        canonical: `${baseUrl}/search`,
      },
    };
  }

  let title = seo.catalogTitlePattern || "{query} — купить по выгодной цене | wobuy.";
  title = title.replace(/\{query\}/g, query).replace(/\{category\}/g, query);

  const description = `Искать «${query}» на Wildberries и Ozon: сравнение цен, честные отзывы ИИ, анти-фейк анализ и проверка сроков доставки на ${seo.siteName}.`;
  const canonicalUrl = `${baseUrl}/search?q=${encodeURIComponent(query)}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const view = params.view === "list" ? "list" : "grid";
  const seo = getSeoSettings();
  const flags = getFeatureFlags();

  // Если запрос пустой (например при возврате назад), проверяем сохраненную куку последнего поиска
  if (!query) {
    try {
      const cookieStore = await cookies();
      const lastQuery = cookieStore.get("wobuy_last_query")?.value;
      if (lastQuery && lastQuery.trim()) {
        redirect(`/search?q=${encodeURIComponent(lastQuery.trim())}`);
      }
    } catch (err) {
      if ((err as Error)?.message?.includes("NEXT_REDIRECT")) {
        throw err;
      }
    }
  }

  // Запуск поискового конвейера
  const products = query ? await searchProducts(query) : [];

  // Формируем Гибридную Матрицу 2+2 на сервере если включена в настройках
  let initialMatrix = null;
  if (flags.enableDuelMatrix && products.length > 0) {
    try {
      initialMatrix = buildHybridMatrix2x2(products, query);
    } catch (err) {
      console.warn("[SearchPage] Failed to build server matrix:", err);
    }
  }

  const baseUrl = (seo.canonicalBaseUrl || "https://wobuy.ru").replace(/\/+$/, "");
  const breadcrumbJsonLd = seo.jsonLdEnabled
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Главная",
            "item": baseUrl,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": query ? `Поиск: ${query}` : "Поиск",
            "item": query ? `${baseUrl}/search?q=${encodeURIComponent(query)}` : `${baseUrl}/search`,
          },
        ],
      }
    : null;

  return (
    <>
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <SearchResults query={query} products={products} view={view} initialMatrix={initialMatrix} />
    </>
  );
}

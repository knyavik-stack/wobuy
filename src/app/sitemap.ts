import { MetadataRoute } from "next";
import { getSeoSettings, getSemanticClusters } from "@/lib/admin/settings-store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient as createPublicSupabaseClient } from "@/lib/supabase/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = getSeoSettings();
  if (!seo.sitemapEnabled) {
    return [];
  }

  const baseUrl = (seo.canonicalBaseUrl || "https://wobuy.ru").replace(/\/+$/, "");
  const now = new Date();

  // 1. Главные статические и юридические страницы
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/consent`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/legal/cookies`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 2. Страницы категорий и семантического ядра
  const semanticClusters = getSemanticClusters();
  const semanticRoutes: MetadataRoute.Sitemap = semanticClusters.flatMap((cluster) => {
    const clusterUrl: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/search?category=${encodeURIComponent(cluster.category)}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.85,
      },
    ];

    const queryUrls: MetadataRoute.Sitemap = cluster.popularQueries.map((q) => ({
      url: `${baseUrl}/search?q=${encodeURIComponent(q.query)}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: Number(q.priority.toFixed(2)),
    }));

    return [...clusterUrl, ...queryUrls];
  });

  // 3. Товары из Supabase (если доступны)
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = getSupabaseAdmin() || createPublicSupabaseClient();
    if (supabase) {
      const { data: products } = await supabase
        .from("products")
        .select("id, updated_at, category")
        .eq("is_active", true)
        .limit(1000);

      if (products && products.length > 0) {
        productRoutes = products.map((p) => ({
          url: `${baseUrl}/product/${p.id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
      }
    }
  } catch (err) {
    console.warn("[Sitemap] Ошибка выборки товаров из Supabase:", err);
  }

  // Объединяем и удаляем возможные дубликаты URL
  const allRoutes = [...staticRoutes, ...semanticRoutes, ...productRoutes];
  const uniqueMap = new Map<string, MetadataRoute.Sitemap[number]>();
  allRoutes.forEach((route) => {
    if (!uniqueMap.has(route.url)) {
      uniqueMap.set(route.url, route);
    }
  });

  return Array.from(uniqueMap.values());
}

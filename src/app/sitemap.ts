import { MetadataRoute } from "next";
import { getSeoSettings } from "@/lib/admin/settings-store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient as createPublicSupabaseClient } from "@/lib/supabase/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = getSeoSettings();
  if (!seo.sitemapEnabled) {
    return [];
  }

  const baseUrl = (seo.canonicalBaseUrl || "https://wobuy.ru").replace(/\/+$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Получаем список товаров из Supabase
  try {
    const supabase = getSupabaseAdmin() || createPublicSupabaseClient();
    if (supabase) {
      const { data: products } = await supabase
        .from("products")
        .select("id, updated_at, category")
        .eq("is_active", true)
        .limit(1000);

      if (products && products.length > 0) {
        const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
          url: `${baseUrl}/product/${p.id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));

        // Извлекаем уникальные категории для карты сайта
        const categories = Array.from(
          new Set(products.map((p) => p.category).filter(Boolean)),
        );
        const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
          url: `${baseUrl}/catalog?category=${encodeURIComponent(cat)}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.85,
        }));

        return [...staticRoutes, ...categoryRoutes, ...productRoutes];
      }
    }
  } catch (err) {
    console.warn("[Sitemap] Ошибка выборки товаров из Supabase:", err);
  }

  return staticRoutes;
}

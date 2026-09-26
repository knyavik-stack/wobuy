import { MetadataRoute } from "next";
import { getSeoSettings } from "@/lib/admin/settings-store";

export default function robots(): MetadataRoute.Robots {
  const seo = getSeoSettings();
  const baseUrl = (seo.canonicalBaseUrl || "https://wobuy.ru").replace(/\/+$/, "");

  const isNoIndex = seo.robotsIndexing.includes("noindex");

  if (isNoIndex) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/catalog", "/product/"],
        disallow: ["/admin", "/admin/*", "/api/*", "/dashboard", "/dashboard/*", "/login", "/register"],
      },
      {
        userAgent: "Yandex",
        allow: ["/", "/catalog", "/product/"],
        disallow: ["/admin", "/admin/*", "/api/*", "/dashboard", "/dashboard/*"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/catalog", "/product/"],
        disallow: ["/admin", "/admin/*", "/api/*", "/dashboard", "/dashboard/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

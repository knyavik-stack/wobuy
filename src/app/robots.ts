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

  const robotsConfig = seo.robotsSettings;
  const disallow = robotsConfig?.disallowPaths && robotsConfig.disallowPaths.length > 0
    ? robotsConfig.disallowPaths
    : ["/admin", "/admin/*", "/api/*", "/dashboard", "/dashboard/*", "/login", "/register", "/cart"];

  const allow = robotsConfig?.allowPaths && robotsConfig.allowPaths.length > 0
    ? robotsConfig.allowPaths
    : ["/", "/catalog", "/catalog/*", "/product/*", "/search", "/privacy", "/consent", "/terms", "/contacts", "/legal/cookies"];

  const crawlDelay = robotsConfig?.crawlDelay && robotsConfig.crawlDelay > 0 ? robotsConfig.crawlDelay : undefined;

  return {
    rules: [
      {
        userAgent: "*",
        allow,
        disallow,
        crawlDelay,
      },
      {
        userAgent: "Yandex",
        allow,
        disallow,
        crawlDelay,
      },
      {
        userAgent: "Googlebot",
        allow,
        disallow,
        crawlDelay,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

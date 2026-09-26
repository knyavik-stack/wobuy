import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { getSeoSettings } from "@/lib/admin/settings-store";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoSettings();
  const canonicalUrl = seo.canonicalBaseUrl || "https://wobuy.ru";

  const isNoIndex = seo.robotsIndexing.includes("noindex");
  const isNoFollow = seo.robotsIndexing.includes("nofollow");

  const verification: Record<string, string> = {};
  if (seo.yandexVerification) verification.yandex = seo.yandexVerification;
  if (seo.googleVerification) verification.google = seo.googleVerification;

  return {
    metadataBase: new URL(canonicalUrl),
    title: {
      default: seo.defaultTitle,
      template: seo.titleTemplate,
    },
    description: seo.defaultDescription,
    keywords: seo.siteKeywords ? seo.siteKeywords.split(",").map((k) => k.trim()) : undefined,
    applicationName: seo.siteName,
    authors: [{ name: seo.siteName, url: canonicalUrl }],
    creator: seo.siteName,
    publisher: seo.siteName,
    formatDetection: {
      telephone: false,
      date: false,
      address: false,
      email: false,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: canonicalUrl,
      siteName: seo.siteName,
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      images: [
        {
          url: seo.ogImageUrl.startsWith("http") ? seo.ogImageUrl : `${canonicalUrl}${seo.ogImageUrl}`,
          width: 1200,
          height: 630,
          alt: seo.siteName,
        },
      ],
    },
    twitter: {
      card: seo.twitterCardType || "summary_large_image",
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      images: [seo.ogImageUrl.startsWith("http") ? seo.ogImageUrl : `${canonicalUrl}${seo.ogImageUrl}`],
    },
    robots: {
      index: !isNoIndex,
      follow: !isNoFollow,
      googleBot: {
        index: !isNoIndex,
        follow: !isNoFollow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: "/icon.svg",
      shortcut: "/icon.svg",
      apple: "/icon.svg",
    },
    verification: Object.keys(verification).length > 0 ? verification : undefined,
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const seo = getSeoSettings();
  const canonicalUrl = seo.canonicalBaseUrl || "https://wobuy.ru";

  const rootJsonLd = seo.jsonLdEnabled
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebApplication",
            "@id": `${canonicalUrl}/#webapp`,
            "name": seo.siteName,
            "url": canonicalUrl,
            "applicationCategory": "ShoppingApplication",
            "operatingSystem": "All",
            "description": seo.defaultDescription,
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "RUB",
            },
          },
          {
            "@type": "Organization",
            "@id": `${canonicalUrl}/#org`,
            "name": seo.siteName,
            "url": canonicalUrl,
            "logo": `${canonicalUrl}/icon.svg`,
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer support",
              "email": "support@wobuy.ru",
              "availableLanguage": ["Russian"],
            },
          },
          {
            "@type": "WebSite",
            "@id": `${canonicalUrl}/#website`,
            "url": canonicalUrl,
            "name": seo.siteName,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${canonicalUrl}/?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          },
        ],
      }
    : null;

  return (
    <html lang="ru" className="bg-[#0D0F14]">
      <head>
        {rootJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }}
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden bg-[#0D0F14] text-slate-100">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

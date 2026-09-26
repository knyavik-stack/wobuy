import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Layers, Search, ArrowRight, Tag, Sparkles, Home, ChevronRight } from "lucide-react";
import { getSemanticClusters, getSeoSettings } from "@/lib/admin/settings-store";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { FaqSection } from "@/components/seo/FaqSection";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoSettings();
  const baseUrl = (seo.canonicalBaseUrl || "https://wobuy.ru").replace(/\/+$/, "");

  return {
    title: "Каталог категорий и сравнение цен Wildberries и Ozon",
    description:
      "Полный рубрикатор и семантический каталог товаров wobuy: смартфоны, ноутбуки, бытовая техника, аудио и красота с проверкой честности скидок.",
    alternates: {
      canonical: `${baseUrl}/catalog`,
    },
  };
}

export default function CatalogIndexPage() {
  const clusters = getSemanticClusters();
  const seo = getSeoSettings();
  const baseUrl = (seo.canonicalBaseUrl || "https://wobuy.ru").replace(/\/+$/, "");

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Каталог категорий",
        item: `${baseUrl}/catalog`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-[#0A0C10]/90 px-4 backdrop-blur-xl sm:px-8 lg:px-14">
        <BrandLogo size="md" />
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-xl bg-[#00FF87] px-4 py-2 text-xs font-bold text-black transition hover:bg-[#00E576]"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Умный поиск</span>
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-8 lg:px-14">
        {/* Хлебные крошки */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="flex items-center gap-1 hover:text-white transition">
            <Home className="h-3.5 w-3.5" />
            <span>Главная</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="text-[#00FF87] font-semibold">Каталог разделов</span>
        </nav>

        {/* H1 заголовок каталога */}
        <div className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-8 shadow-2xl mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#00FF87]/30 bg-[#00FF87]/10 px-3 py-1 text-xs font-semibold text-[#00FF87]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Рубрикатор умного поиска (ЧПУ)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">
            Каталог сравнения цен на Wildberries и Ozon
          </h1>
          <p className="mt-2 max-w-3xl text-xs sm:text-sm text-slate-300 leading-relaxed">
            Выберите интересующий раздел каталога, чтобы перейти к проверенным подборкам товаров с расчетом реальной скидки, анализом отзывов Анти-Фейк и прямым сравнением стоимости между маркетплейсами.
          </p>
        </div>

        {/* Сетка всех семантических кластеров */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {clusters.map((cluster) => (
            <section
              key={cluster.id}
              className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0E1118] p-6 transition hover:border-[#00FF87]/40"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white sm:text-lg">
                        <Link href={`/catalog/${cluster.slug}`} className="hover:text-[#00FF87] transition">
                          {cluster.category}
                        </Link>
                      </h2>
                      <span className="text-[11px] font-mono text-slate-500">
                        /catalog/{cluster.slug}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/catalog/${cluster.slug}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#00FF87] hover:bg-[#00FF87]/15 transition shrink-0"
                  >
                    <span>В раздел</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {cluster.metaDescription}
                </p>

                {/* Популярные запросы внутри категории */}
                <div className="space-y-2">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Популярные подборки раздела:
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {cluster.popularQueries.map((q, idx) => (
                      <Link
                        key={idx}
                        href={`/search?q=${encodeURIComponent(q.query)}`}
                        className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-slate-950/70 px-3 py-2 text-xs text-slate-200 hover:border-[#00FF87]/40 hover:text-[#00FF87] transition"
                      >
                        <span className="truncate">{q.anchorText}</span>
                        <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-4">
                <Tag className="h-3 w-3 text-slate-500 mr-1" />
                {cluster.keywords.slice(0, 5).map((kw, i) => (
                  <Link
                    key={i}
                    href={`/search?q=${encodeURIComponent(kw)}`}
                    className="rounded-lg bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400 hover:text-white transition"
                  >
                    {kw}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <FaqSection items={seo.faqItems} enableSchema={seo.enableFaqSchema !== false} />
      </main>
    </div>
  );
}

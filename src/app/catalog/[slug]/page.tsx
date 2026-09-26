import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Layers,
  Search,
  ArrowRight,
  Tag,
  ShieldCheck,
  Home,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getSemanticClusters, getSeoSettings } from "@/lib/admin/settings-store";
import { BrandLogo } from "@/components/brand/BrandLogo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const clusters = getSemanticClusters();
  const seo = getSeoSettings();
  const baseUrl = (seo.canonicalBaseUrl || "https://wobuy.ru").replace(/\/+$/, "");

  const cluster = clusters.find((c) => c.slug === slug || c.id === slug);
  if (!cluster) {
    return {
      title: "Раздел не найден",
    };
  }

  return {
    title: cluster.h1Title.slice(0, 60),
    description: cluster.metaDescription.slice(0, 160),
    keywords: cluster.keywords,
    alternates: {
      canonical: `${baseUrl}/catalog/${cluster.slug}`,
    },
    openGraph: {
      title: cluster.h1Title,
      description: cluster.metaDescription,
      url: `${baseUrl}/catalog/${cluster.slug}`,
      type: "website",
    },
  };
}

export default async function CatalogCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const clusters = getSemanticClusters();
  const seo = getSeoSettings();
  const baseUrl = (seo.canonicalBaseUrl || "https://wobuy.ru").replace(/\/+$/, "");

  const cluster = clusters.find((c) => c.slug === slug || c.id === slug);
  if (!cluster) {
    notFound();
  }

  const otherClusters = clusters.filter((c) => c.id !== cluster.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
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
            name: "Каталог",
            item: `${baseUrl}/catalog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: cluster.category,
            item: `${baseUrl}/catalog/${cluster.slug}`,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: cluster.h1Title,
        description: cluster.metaDescription,
        url: `${baseUrl}/catalog/${cluster.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-[#0A0C10]/90 px-4 backdrop-blur-xl sm:px-8 lg:px-14">
        <BrandLogo size="md" />
        <div className="flex items-center gap-3">
          <Link
            href="/catalog"
            className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-white/20"
          >
            Все разделы
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00FF87] px-4 py-2 text-xs font-bold text-black transition hover:bg-[#00E576]"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Поиск</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-8 lg:px-14 space-y-8">
        {/* Хлебные крошки */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="flex items-center gap-1 hover:text-white transition">
            <Home className="h-3.5 w-3.5" />
            <span>Главная</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <Link href="/catalog" className="hover:text-white transition">
            Каталог
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="text-[#00FF87] font-semibold">{cluster.category}</span>
        </nav>

        {/* Главный H1 блок категории */}
        <section className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-8 shadow-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#00FF87]/30 bg-[#00FF87]/10 px-3 py-1 text-xs font-semibold text-[#00FF87]">
            <Layers className="h-3.5 w-3.5" />
            <span>Категория: {cluster.category}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">
            {cluster.h1Title}
          </h1>
          <p className="mt-2.5 max-w-3xl text-xs sm:text-sm text-slate-300 leading-relaxed">
            {cluster.metaDescription}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-emerald-400">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Проверка истории цен WB & Ozon</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-cyan-300">
              <Sparkles className="h-4 w-4" />
              <span>Защита от накрученных отзывов</span>
            </span>
          </div>
        </section>

        {/* H2: Подборки и прямые поисковые запросы */}
        <section className="rounded-3xl border border-white/10 bg-[#0E1118] p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Популярные товары и сравнение цен в разделе «{cluster.category}»
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Нажмите на любую карточку запроса для запуска живого сравнения цен между Wildberries и Ozon в матрице 2x2.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {cluster.popularQueries.map((item, idx) => (
              <Link
                key={idx}
                href={`/search?q=${encodeURIComponent(item.query)}`}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-950/80 p-4 transition-all hover:border-[#00FF87]/50 hover:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#00FF87] transition">
                      {item.anchorText}
                    </h3>
                    <Search className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-[#00FF87]" />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Поисковый запрос: <span className="text-slate-300 font-medium">«{item.query}»</span>
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5">
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.map((t, i) => (
                      <span
                        key={i}
                        className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#00FF87]">
                    <span>Сравнить</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Ключевые слова кластера */}
          <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
              <Tag className="h-3.5 w-3.5 text-[#00FF87]" />
              <span>Быстрые теги категории:</span>
            </span>
            {cluster.keywords.map((kw, i) => (
              <Link
                key={i}
                href={`/search?q=${encodeURIComponent(kw)}`}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:border-[#00FF87]/40 hover:text-white transition"
              >
                {kw}
              </Link>
            ))}
          </div>
        </section>

        {/* H2: Перелинковка на соседние разделы каталога */}
        {otherClusters.length > 0 && (
          <section className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white sm:text-lg">
              Другие разделы умного каталога wobuy
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {otherClusters.map((other) => (
                <Link
                  key={other.id}
                  href={`/catalog/${other.slug}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs font-semibold text-slate-200 hover:border-[#00FF87]/40 hover:text-[#00FF87] transition"
                >
                  <span className="truncate">{other.category}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

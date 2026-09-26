"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Tag, Search, TrendingUp, Layers } from "lucide-react";
import { SemanticCluster } from "@/lib/admin/types";
import { DEFAULT_SEMANTIC_CLUSTERS } from "@/lib/seo/semantic-core";

interface SemanticHubsProps {
  clusters?: SemanticCluster[];
}

export function SemanticHubs({ clusters = DEFAULT_SEMANTIC_CLUSTERS }: SemanticHubsProps) {
  const [selectedClusterId, setSelectedClusterId] = useState<string>(clusters[0]?.id || "smartphones");
  const activeCluster = clusters.find((c) => c.id === selectedClusterId) || clusters[0];

  if (!clusters || clusters.length === 0) return null;

  return (
    <section className="relative my-16 rounded-3xl border border-white/10 bg-[#10131A] p-6 shadow-2xl md:p-10">
      <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-[#00FF87]/10 blur-3xl pointer-events-none" />

      {/* Заголовок блока с SEO H2 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00FF87]/30 bg-[#00FF87]/10 px-3 py-1 text-xs font-semibold text-[#00FF87] mb-2">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Популярные категории и сравнение цен</span>
          </div>
          <h2 className="text-xl font-bold text-white md:text-2xl">
            Каталог умного поиска и семантические кластеры
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Быстрый переход к проверенным карточкам товаров со 100% подтвержденными скидками и рейтингом честности.
          </p>
        </div>

        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00FF87] hover:underline shrink-0"
        >
          <span>Смотреть весь каталог</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Табы категорий */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {clusters.map((c) => {
          const isActive = c.id === selectedClusterId;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedClusterId(c.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-[#00FF87] border border-[#00FF87]/40 shadow-lg shadow-[#00FF87]/10"
                  : "bg-slate-900/60 text-slate-400 border border-white/5 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{c.category}</span>
            </button>
          );
        })}
      </div>

      {/* Содержимое активного кластера (H3 + перелинковка с анкорами) */}
      {activeCluster && (
        <div className="mt-6 rounded-2xl border border-white/5 bg-slate-900/50 p-6">
          <div className="flex flex-col gap-1 mb-4">
            <h3 className="text-base font-bold text-white">
              {activeCluster.h1Title}
            </h3>
            <p className="text-xs text-slate-400">
              {activeCluster.metaDescription}
            </p>
          </div>

          {/* Список ключевых анкоров для перелинковки */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {activeCluster.popularQueries.map((item, idx) => (
              <Link
                key={idx}
                href={`/search?q=${encodeURIComponent(item.query)}`}
                className="group flex flex-col justify-between rounded-xl border border-white/5 bg-slate-950/60 p-3.5 hover:border-[#00FF87]/40 hover:bg-slate-900 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-[#00FF87] transition-colors leading-snug">
                    {item.anchorText}
                  </span>
                  <Search className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#00FF87] shrink-0 mt-0.5" />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {item.tags?.map((t, i) => (
                    <span
                      key={i}
                      className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                  <span className="ml-auto text-[10px] text-emerald-400 font-medium">
                    WB & Ozon
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Теги ключевых слов для поисковых ботов */}
          <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-white/5">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Tag className="h-3 w-3 text-slate-500" />
              <span>Поисковые метки:</span>
            </span>
            {activeCluster.keywords.map((kw, i) => (
              <Link
                key={i}
                href={`/search?q=${encodeURIComponent(kw)}`}
                className="rounded-lg bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                {kw}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

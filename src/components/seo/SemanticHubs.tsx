"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Tag, Search, TrendingUp, Layers, FolderOpen } from "lucide-react";
import { SemanticCluster } from "@/lib/admin/types";
import { DEFAULT_SEMANTIC_CLUSTERS } from "@/lib/seo/semantic-core";

interface SemanticHubsProps {
  clusters?: SemanticCluster[];
}

export function SemanticHubs({ clusters = DEFAULT_SEMANTIC_CLUSTERS }: SemanticHubsProps) {
  const [selectedClusterId, setSelectedClusterId] = useState<string>(
    clusters[0]?.id || "smartphones",
  );
  const activeCluster = clusters.find((c) => c.id === selectedClusterId) || clusters[0];

  if (!clusters || clusters.length === 0) return null;

  return (
    <section
      id="smart-catalog-hubs"
      className="relative my-10 overflow-hidden rounded-3xl border border-white/10 bg-[#10131A] p-4 shadow-2xl sm:p-6 md:p-8"
    >
      <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-[#00FF87]/10 blur-3xl" />

      {/* Заголовок блока с SEO H2 */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#00FF87]/30 bg-[#00FF87]/10 px-3 py-1 text-[11px] font-semibold text-[#00FF87]">
            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
            <span>Популярные разделы и закладки поиска</span>
          </div>
          <h2 className="text-lg font-extrabold text-white sm:text-xl md:text-2xl">
            Каталог умного поиска по маркетплейсам
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Выберите раздел или готовую закладку для мгновенного сравнения цен Wildberries и Ozon с проверкой скидок.
          </p>
        </div>

        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[#00FF87]/30 bg-[#00FF87]/10 px-3.5 py-2 text-xs font-semibold text-[#00FF87] transition hover:bg-[#00FF87]/20 sm:self-auto shrink-0"
        >
          <span>Все разделы каталога</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Адаптивные разделы каталога (flex-wrap / сетка — помещаются на любом экране без обрезки) */}
      <div
        role="tablist"
        aria-label="Разделы каталога"
        className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:flex-wrap"
      >
        {clusters.map((c) => {
          const isActive = c.id === selectedClusterId;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedClusterId(c.id)}
              className={`flex min-w-0 items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all md:justify-start ${
                isActive
                  ? "border border-[#00FF87]/50 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-[#00FF87] shadow-md shadow-[#00FF87]/10"
                  : "border border-white/10 bg-slate-900/70 text-slate-300 hover:border-white/20 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Layers className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{c.category}</span>
              </span>
              <span
                className={`ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-mono shrink-0 ${
                  isActive ? "bg-[#00FF87]/20 text-[#00FF87]" : "bg-white/5 text-slate-400"
                }`}
              >
                {c.popularQueries.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Содержимое активного раздела (H3 + адаптивные закладки запросов) */}
      {activeCluster && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/50 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white sm:text-base">
                {activeCluster.h1Title}
              </h3>
              <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                {activeCluster.metaDescription}
              </p>
            </div>

            <Link
              href={`/catalog/${activeCluster.slug}`}
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-200 transition hover:border-[#00FF87]/40 hover:text-[#00FF87] shrink-0"
            >
              <FolderOpen className="h-3.5 w-3.5 text-[#00FF87]" />
              <span>Открыть раздел «{activeCluster.category}»</span>
            </Link>
          </div>

          {/* Сетка закладок для быстрого поиска */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {activeCluster.popularQueries.map((item, idx) => (
              <Link
                key={idx}
                href={`/search?q=${encodeURIComponent(item.query)}`}
                className="group flex min-w-0 flex-col justify-between rounded-xl border border-white/10 bg-slate-950/70 p-3.5 transition-all hover:border-[#00FF87]/40 hover:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 break-words text-xs font-semibold leading-snug text-slate-200 transition-colors group-hover:text-[#00FF87]">
                    {item.anchorText}
                  </span>
                  <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 transition-colors group-hover:text-[#00FF87]" />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-white/5">
                  <div className="flex flex-wrap items-center gap-1 min-w-0">
                    {item.tags?.slice(0, 3).map((t, i) => (
                      <span
                        key={i}
                        className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 shrink-0">
                    WB vs Ozon →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Быстрые теги-закладки ключевых слов */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-3.5">
            <span className="mr-1 flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Tag className="h-3 w-3 text-slate-500" />
              <span>Быстрые закладки:</span>
            </span>
            {activeCluster.keywords.map((kw, i) => (
              <Link
                key={i}
                href={`/search?q=${encodeURIComponent(kw)}`}
                className="rounded-lg border border-white/5 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-[#00FF87]/30 hover:bg-slate-800 hover:text-white"
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

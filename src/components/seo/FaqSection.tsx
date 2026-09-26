"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, Sparkles, Search } from "lucide-react";
import { FaqItemConfig } from "@/lib/admin/types";
import { DEFAULT_FAQ_ITEMS } from "@/lib/seo/faq-defaults";
import { NeonDot } from "@/components/brand/WobuyDot";

interface FaqSectionProps {
  items?: FaqItemConfig[];
  enableSchema?: boolean;
}

export function FaqSection({
  items = DEFAULT_FAQ_ITEMS,
  enableSchema = true,
}: FaqSectionProps) {
  const validItems = items && items.length > 0 ? items : DEFAULT_FAQ_ITEMS;
  const [openId, setOpenId] = useState<string | null>(validItems[0]?.id || null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Все");

  const categories = ["Все", ...Array.from(new Set(validItems.map((i) => i.category).filter(Boolean)))];
  const filteredItems =
    selectedCategory === "Все"
      ? validItems
      : validItems.filter((i) => i.category === selectedCategory);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section
      id="seo-faq-section"
      aria-labelledby="faq-heading"
      className="relative my-10 overflow-hidden rounded-3xl border border-white/10 bg-[#0E1118] p-4 shadow-2xl sm:p-6 md:p-8"
    >
      {enableSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Заголовок блока FAQ */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-300">
            <HelpCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Частые вопросы покупателей (FAQ)</span>
          </div>
          <h2 id="faq-heading" className="text-lg font-extrabold text-white sm:text-xl md:text-2xl">
            Как работает умный поиск и проверка скидок wobuy
            <NeonDot size="sm" />
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Ответы на главные вопросы о сравнении цен Wildberries и Ozon, алгоритме Анти-Фейк и поиске по артикулу.
          </p>
        </div>

        {/* Фильтр по темам вопросов */}
        {categories.length > 2 && (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
                    active
                      ? "border border-[#00FF87]/40 bg-[#00FF87]/15 text-[#00FF87]"
                      : "border border-white/5 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Аккордеон с микроразметкой */}
      <div className="mt-5 space-y-2.5">
        {filteredItems.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? "border-[#00FF87]/35 bg-slate-900/80 shadow-lg shadow-[#00FF87]/5"
                  : "border-white/5 bg-slate-950/60 hover:border-white/15 hover:bg-slate-900/40"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
              >
                <div className="min-w-0 space-y-1">
                  {item.category && (
                    <span className="inline-block rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                      {item.category}
                    </span>
                  )}
                  <h3
                    itemProp="name"
                    className="text-xs font-bold leading-snug text-white sm:text-sm md:text-base"
                  >
                    {item.question}
                  </h3>
                </div>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border transition-transform ${
                    isOpen
                      ? "rotate-180 border-[#00FF87]/40 bg-[#00FF87]/15 text-[#00FF87]"
                      : "border-white/10 bg-white/5 text-slate-400"
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
                className={`overflow-hidden transition-all duration-200 ${
                  isOpen ? "max-h-96 border-t border-white/5 px-4 pb-4 pt-3 sm:px-5 sm:pb-5" : "max-h-0"
                }`}
              >
                <p itemProp="text" className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                  {item.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Нижняя подсказка */}
      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <Sparkles className="h-4 w-4 shrink-0 text-[#00FF87]" />
          <span>Хотите проверить конкретный товар прямо сейчас? Введите название или артикул WB в поиске.</span>
        </div>
        <a
          href="/search"
          className="inline-flex items-center gap-1.5 self-start rounded-xl bg-[#00FF87] px-4 py-2 text-xs font-bold text-black transition hover:bg-[#00E576] sm:self-auto shrink-0"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Перейти к поиску</span>
        </a>
      </div>
    </section>
  );
}

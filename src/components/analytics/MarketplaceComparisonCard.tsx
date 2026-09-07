"use client";

import React from "react";
import { ExternalLink, Check, Zap, Sparkles } from "lucide-react";
import { MarketplaceBadge } from "@/components/ui/MarketplaceBadge";
import { MarketplaceComparisonItem } from "@/lib/ai/analyzer";

function formatPrice(price: number, currency: string = "RUB") {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

interface MarketplaceComparisonCardProps {
  items: MarketplaceComparisonItem[];
  wobuyDecision: string;
  currency?: string;
}

export function MarketplaceComparisonCard({
  items,
  wobuyDecision,
  currency = "RUB",
}: MarketplaceComparisonCardProps) {
  const minPrice = Math.min(...items.map((i) => i.price));

  return (
    <section className="overflow-hidden rounded-3xl border border-[#00FF87]/30 bg-[#12151B] p-5 shadow-2xl backdrop-blur-md sm:p-6">
      {/* Заголовок карточки */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#00FF87]/15 border border-[#00FF87]/40 text-[#00FF87]">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-white sm:text-lg">
              Сравнение маркетплейсов и итоговое решение wobuy.
            </h2>
            <p className="text-xs text-slate-400">
              Прямое сравнение цен, условий доставки и возврата со складов маркетплейсов
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-bold text-[#00FF87]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Экономия до {formatPrice(Math.max(...items.map((i) => i.price)) - minPrice, currency)}</span>
        </div>
      </div>

      {/* Итоговое решение от wobuy. */}
      <div className="mt-5 rounded-2xl border border-[#00FF87]/40 bg-gradient-to-r from-emerald-950/40 via-[#13161C] to-emerald-950/20 p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00FF87] text-black text-xs font-black">
            ✓
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#00FF87]">
              Заключение и рекомендация wobuy.
            </div>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-200 sm:text-sm">
              {wobuyDecision}
            </p>
          </div>
        </div>
      </div>

      {/* Сравнительная сетка предложений маркетплейсов */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {items.map((item, idx) => {
          const isBest = item.price === minPrice;

          return (
            <div
              key={idx}
              className={`relative flex flex-col justify-between rounded-2xl border p-4.5 transition duration-200 ${
                isBest
                  ? "border-[#00FF87] bg-emerald-950/25 shadow-[0_0_20px_rgba(0,255,135,0.15)]"
                  : "border-white/10 bg-[#0D0F14] hover:border-white/20"
              }`}
            >
              {isBest && (
                <div className="absolute -top-3 right-4 rounded-full bg-[#00FF87] px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-md">
                  ★ Лучшая цена
                </div>
              )}

              <div>
                {/* Маркетплейс */}
                <div className="flex items-center justify-between">
                  <MarketplaceBadge marketplace={item.marketplace} size="md" showLabel={true} />
                  <span className="text-[11px] font-semibold text-slate-400">
                    {item.advantage}
                  </span>
                </div>

                {/* Цена */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className={`text-2xl font-black ${isBest ? "text-[#00FF87]" : "text-white"}`}>
                    {formatPrice(item.price, currency)}
                  </span>
                  {isBest && (
                    <span className="rounded-md bg-[#00FF87]/20 px-2 py-0.5 text-[11px] font-bold text-[#00FF87]">
                      Минимум
                    </span>
                  )}
                </div>

                {/* Характеристики доставки и возврата */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00FF87]" />
                    <div>
                      <span className="text-slate-400">Доставка: </span>
                      <strong className="text-white">{item.delivery}</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00FF87]" />
                    <div>
                      <span className="text-slate-400">Возврат: </span>
                      <span>{item.returnPolicy}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Кнопка перехода */}
              <div className="mt-5">
                <a
                  href={item.url || "https://www.wildberries.ru"}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex h-11 w-full items-center justify-center gap-2 rounded-full text-xs font-extrabold transition ${
                    isBest
                      ? "bg-[#00FF87] text-black shadow-[0_0_15px_rgba(0,255,135,0.4)] hover:bg-[#00E576]"
                      : "border border-white/15 bg-white/5 text-white hover:border-[#00FF87]/50 hover:bg-white/10"
                  }`}
                >
                  <span>Купить на {item.name}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

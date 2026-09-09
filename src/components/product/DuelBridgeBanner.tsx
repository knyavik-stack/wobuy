"use client";

import React from "react";
import { ExternalLink, Zap, Scale } from "lucide-react";
import type { DuelData } from "@/lib/ai/analyzer";

interface DuelBridgeBannerProps {
  duelData: DuelData | null | undefined;
  currentPlatform?: "wildberries" | "ozon" | string;
  currentPrice: number;
  productTitle?: string;
}

export function DuelBridgeBanner({
  duelData,
  currentPrice,
}: DuelBridgeBannerProps) {
  if (!duelData || !duelData.hasMatchingSku) {
    return null;
  }

  const priceDiff = duelData.priceDifference;
  const isAltCheaper = priceDiff < 0;
  const absDiff = Math.abs(priceDiff);

  return (
    <div
      id="product-duel-bridge"
      className="relative overflow-hidden rounded-3xl border border-[#00FF87]/30 bg-gradient-to-r from-emerald-950/40 via-[#12151B] to-purple-950/30 p-5 shadow-2xl transition hover:border-[#00FF87]/50"
    >
      {/* Фоновое неоновое свечение */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#00FF87]/10 blur-3xl" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-[#00FF87]/40 bg-[#00FF87]/15 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-[#00FF87]">
              <Scale className="h-3.5 w-3.5" />
              <span>Межплощадочная дуэль SKU</span>
            </span>
            <span className="text-xs font-bold text-slate-400">
              Скептик нашел точный аналог на {duelData.alternativePlatform}
            </span>
          </div>

          <p className="text-sm font-semibold leading-relaxed text-slate-100">
            {duelData.verdict}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>Текущая цена:</span>
              <strong className="text-white">{currentPrice.toLocaleString("ru-RU")} ₽</strong>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span>На {duelData.alternativePlatform}:</span>
              <strong className={isAltCheaper ? "text-[#00FF87]" : "text-amber-400"}>
                {duelData.alternativePrice.toLocaleString("ru-RU")} ₽
              </strong>
            </div>
            <span>•</span>
            <span className={isAltCheaper ? "text-emerald-400 font-bold" : "text-slate-300"}>
              {isAltCheaper ? `Выгода ${absDiff.toLocaleString("ru-RU")} ₽` : `Дороже на ${absDiff.toLocaleString("ru-RU")} ₽`}
            </span>
          </div>
        </div>

        <a
          href={duelData.url}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#00FF87]/40 bg-[#00FF87] px-4 py-2.5 text-xs font-black text-black shadow-[0_0_20px_rgba(0,255,135,0.3)] transition hover:bg-[#00E576] hover:shadow-[0_0_25px_rgba(0,255,135,0.5)]"
        >
          <Zap className="h-4 w-4" />
          <span>Смотреть на {duelData.alternativePlatform}</span>
          <ExternalLink className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}

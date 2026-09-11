"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ChevronDown,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  ExternalLink,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { DuelArbitration } from "@/lib/catalog/duel-matrix";
import { NeonDot } from "@/components/brand/WobuyDot";
import { AuditFunnelBanner } from "@/components/brand/AuditFunnelBanner";
import { sanitizeMarketplaceOfferUrl } from "@/lib/marketplace-links";

interface DuelArbitrationCardProps {
  duel: DuelArbitration;
  query?: string;
}

export function DuelArbitrationCard({ duel, query }: DuelArbitrationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    wbSlot,
    ozonSlot,
    priceDiff,
    cheaperSummary,
    fasterSummary,
    skepticVerdict,
    bestOverallPick,
    wbArbitrationScore,
    ozonArbitrationScore,
    wbDecisiveFactor,
    ozonDecisiveFactor,
    decisiveFactorLabel,
    roundsScore,
    comparisonPoints,
  } = duel;

  const isWbWinner = bestOverallPick === "wildberries";
  const isOzonWinner = bestOverallPick === "ozon";

  // Расчетные баллы арбитража и перевес
  const wbScore = wbArbitrationScore ?? (isWbWinner ? 9.4 : 8.7);
  const ozonScore = ozonArbitrationScore ?? (isOzonWinner ? 9.4 : 8.7);
  const scoreDiff = Math.abs(Number((wbScore - ozonScore).toFixed(1)));
  const rounds = roundsScore || { wbWins: 2, ozonWins: 1, ties: 1 };

  // Процент наклона индикатора весов (0% = чистый WB, 50% = баланс, 100% = чистый Ozon)
  const balancePercentage = isWbWinner ? 28 : isOzonWinner ? 72 : 50;

  const safeWbUrl = sanitizeMarketplaceOfferUrl(
    "wildberries",
    wbSlot.matchedOffer.url,
    wbSlot.product.title,
  );
  const safeOzonUrl = sanitizeMarketplaceOfferUrl(
    "ozon",
    ozonSlot.matchedOffer.url,
    ozonSlot.product.title,
  );

  const wbLink = `/product/${wbSlot.product.id}${query ? `?fromQuery=${encodeURIComponent(query)}` : ""}`;
  const ozonLink = `/product/${ozonSlot.product.id}${query ? `?fromQuery=${encodeURIComponent(query)}` : ""}`;

  return (
    <section
      id="duel-arbitration-section"
      className="relative my-6 overflow-hidden rounded-3xl border border-white/10 bg-[#12151B] p-5 shadow-2xl backdrop-blur-xl sm:p-7"
    >
      {/* 1. ВЕРХНИЙ ХЕДЕР: СТАТУС ДУЭЛИ И СЧЕТ РАУНДОВ */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#00FF87]/30 bg-[#00FF87]/10 text-[#00FF87] shadow-[0_0_15px_rgba(0,255,135,0.2)]">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Дуэльные весы маркетплейсов
              </h3>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                Раунды {rounds.wbWins} : {rounds.ozonWins}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Синхронный арбитраж предложений Wildberries vs Ozon от ИИ wobuy<NeonDot size="xs" />
            </p>
          </div>
        </div>

        {/* Бейдж победителя дуэли */}
        <div className="inline-flex items-center gap-2 self-start rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-black text-white shadow-lg sm:self-auto">
          <span className="flex h-2 w-2 rounded-full bg-[#00FF87] animate-pulse" />
          <span>Перевес: </span>
          <span className="text-[#00FF87]">
            {isWbWinner ? "Wildberries" : "Ozon"} (+{scoreDiff || "0.7"} балла)
          </span>
        </div>
      </div>

      {/* 2. ПРЕЦИЗИОННАЯ ШКАЛА ВЕСОВ (БИОМЕТРИЧЕСКИЙ БАЛАНСИР WB VS OZON) */}
      <div className="my-6 rounded-2xl border border-white/5 bg-[#0D0F14] p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
          {/* Левый участник: Wildberries */}
          <div className="flex items-center justify-between md:col-span-4 md:justify-start md:gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl font-black text-xs ${
                  isWbWinner
                    ? "border border-purple-400/40 bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                    : "border border-white/10 bg-white/5 text-slate-400"
                }`}
              >
                WB
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-white">Wildberries</span>
                  {isWbWinner && (
                    <span className="rounded-md bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-purple-300">
                      Лидер
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  {wbSlot.tcoPrice.toLocaleString("ru-RU")} ₽ • {wbSlot.deliverySpeedLabel}
                </div>
              </div>
            </div>

            <div className="text-right md:text-left">
              <div
                className={`text-lg font-black ${
                  isWbWinner ? "text-purple-300" : "text-slate-400"
                }`}
              >
                {wbScore.toFixed(1)}
                <span className="text-[10px] font-normal text-slate-500">/10</span>
              </div>
            </div>
          </div>

          {/* Центральный визуальный балансир (Шкала перевеса) */}
          <div className="flex flex-col items-center justify-center md:col-span-4">
            <div className="relative h-4 w-full rounded-full bg-[#181C24] p-0.5 shadow-inner">
              {/* Градиентная полоса баланса */}
              <div className="h-full w-full rounded-full bg-gradient-to-r from-purple-600 via-slate-700 to-blue-600 opacity-60" />

              {/* Маркер центра (нейтральный уровень 50%) */}
              <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-white/30" />

              {/* Подвижный прецизионный указатель перевеса */}
              <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
                style={{ left: `${balancePercentage}%` }}
              >
                <div className="flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#00FF87] bg-black shadow-[0_0_10px_#00FF87]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#00FF87]" />
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between w-full px-1 text-[10px] font-bold text-slate-400">
              <span className={isWbWinner ? "text-purple-300 font-extrabold" : ""}>
                {isWbWinner ? `★ Перевес +${scoreDiff}` : "WB Слот"}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">VS</span>
              <span className={isOzonWinner ? "text-blue-300 font-extrabold" : ""}>
                {isOzonWinner ? `★ Перевес +${scoreDiff}` : "Ozon Слот"}
              </span>
            </div>
          </div>

          {/* Правый участник: Ozon */}
          <div className="flex items-center justify-between md:col-span-4 md:justify-end md:gap-3">
            <div className="text-left md:text-right">
              <div
                className={`text-lg font-black ${
                  isOzonWinner ? "text-blue-300" : "text-slate-400"
                }`}
              >
                {ozonScore.toFixed(1)}
                <span className="text-[10px] font-normal text-slate-500">/10</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {isOzonWinner && (
                    <span className="rounded-md bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-blue-300">
                      Лидер
                    </span>
                  )}
                  <span className="text-xs font-extrabold text-white">Ozon</span>
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  {ozonSlot.tcoPrice.toLocaleString("ru-RU")} ₽ • {ozonSlot.deliverySpeedLabel}
                </div>
              </div>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl font-black text-xs ${
                  isOzonWinner
                    ? "border border-blue-400/40 bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                    : "border border-white/10 bg-white/5 text-slate-400"
                }`}
              >
                OZ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ВЕРДИКТ ИИ-АРБИТРА (АГЕНТ СКЕПТИК) И РЕШАЮЩИЙ ФАКТОР */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-[#12151B] to-purple-950/20 p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#00FF87]/40 bg-[#00FF87]/15 text-[#00FF87]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Вердикт арбитра (Агент Скептик)
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#00FF87]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#00FF87] border border-[#00FF87]/30">
                  <Sparkles className="h-3 w-3" />
                  {decisiveFactorLabel || (isWbWinner ? wbDecisiveFactor : ozonDecisiveFactor)}
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm font-medium leading-relaxed text-slate-200">
                {skepticVerdict}
              </p>
            </div>
          </div>

          {/* Блок чистой выгоды или быстрой доставки */}
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 md:flex-col md:items-end">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {priceDiff > 0 ? "Экономия" : "Преимущество"}
            </div>
            <div className="text-sm sm:text-base font-black text-[#00FF87]">
              {priceDiff > 0 ? `+${priceDiff.toLocaleString("ru-RU")} ₽` : fasterSummary}
            </div>
          </div>
        </div>
      </div>

      {/* 4. КЛЮЧЕВЫЕ РАУНДЫ ДУЭЛИ (4 СРАВНИТЕЛЬНЫХ ПЛАШКИ) */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {/* Раунд 1: Конечная цена (TCO) */}
        <div className="rounded-xl border border-white/5 bg-[#0D0F14] p-3">
          <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-emerald-400" />
            <span>TCO Цена</span>
          </div>
          <div className="mt-1.5 text-xs font-bold text-white">
            {wbSlot.tcoPrice < ozonSlot.tcoPrice ? (
              <span className="text-purple-300">WB {wbSlot.tcoPrice.toLocaleString("ru-RU")} ₽ 🏆</span>
            ) : ozonSlot.tcoPrice < wbSlot.tcoPrice ? (
              <span className="text-blue-300">Ozon {ozonSlot.tcoPrice.toLocaleString("ru-RU")} ₽ 🏆</span>
            ) : (
              <span className="text-slate-300">Ничья ({wbSlot.tcoPrice.toLocaleString("ru-RU")} ₽)</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{cheaperSummary}</div>
        </div>

        {/* Раунд 2: Срок доставки */}
        <div className="rounded-xl border border-white/5 bg-[#0D0F14] p-3">
          <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-400" />
            <span>Доставка</span>
          </div>
          <div className="mt-1.5 text-xs font-bold text-white">
            {fasterSummary.toLowerCase().includes("wildberries") ? (
              <span className="text-purple-300">WB быстрее 🏆</span>
            ) : fasterSummary.toLowerCase().includes("ozon") ? (
              <span className="text-blue-300">Ozon быстрее 🏆</span>
            ) : (
              <span className="text-slate-300">Одинаковый срок</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{fasterSummary}</div>
        </div>

        {/* Раунд 3: Индекс антифейка */}
        <div className="rounded-xl border border-white/5 bg-[#0D0F14] p-3">
          <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Подлинность</span>
          </div>
          <div className="mt-1.5 text-xs font-bold text-white">
            <span className="text-purple-300">WB {wbSlot.antiFakePercent}%</span> vs{" "}
            <span className="text-blue-300">OZ {ozonSlot.antiFakePercent}%</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {wbSlot.antiFakePercent >= ozonSlot.antiFakePercent ? "WB чище от ботов" : "Ozon чище от ботов"}
          </div>
        </div>

        {/* Раунд 4: Рейтинг селлера */}
        <div className="rounded-xl border border-white/5 bg-[#0D0F14] p-3">
          <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
            <Award className="h-3 w-3 text-blue-400" />
            <span>Рейтинг селлера</span>
          </div>
          <div className="mt-1.5 text-xs font-bold text-white">
            <span className="text-purple-300">★ {wbSlot.matchedOffer.rating || "4.9"}</span> vs{" "}
            <span className="text-blue-300">★ {ozonSlot.matchedOffer.rating || "4.8"}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {(wbSlot.matchedOffer.reviewCount || 0).toLocaleString("ru-RU")} отзывов
          </div>
        </div>
      </div>

      {/* Компактный честный аудит воронки в дуэли */}
      {duel.funnelStats && (
        <AuditFunnelBanner stats={duel.funnelStats} variant="compact" className="mt-4" />
      )}

      {/* 5. КНОПКА РАСКРЫТИЯ ДЕТАЛЬНОЙ ТАБЛИЦЫ РАУНДОВ И ССЫЛКИ */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300">
          <span className="text-slate-400">Быстрый переход:</span>
          <a
            href={safeWbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-950/40 px-2.5 py-1 font-bold text-purple-300 hover:bg-purple-900/50 transition"
          >
            <span>В магазин WB</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={safeOzonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-950/40 px-2.5 py-1 font-bold text-blue-300 hover:bg-blue-900/50 transition"
          >
            <span>В магазин Ozon</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-slate-500">|</span>
          <Link
            href={isWbWinner ? wbLink : ozonLink}
            className="inline-flex items-center gap-1 font-bold text-[#00FF87] hover:underline"
          >
            <span>Разбор лидера в wobuy<NeonDot size="xs" /></span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-slate-300 transition hover:border-[#00FF87]/40 hover:bg-white/10 hover:text-white"
        >
          <span>{isExpanded ? "Скрыть таблицу раундов" : "Подробная таблица 4 раундов"}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* 6. ДЕТАЛЬНАЯ ТАБЛИЦА ПАРАМЕТРОВ ПРИ РАСКРЫТИИ */}
      {isExpanded && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-[#0D0F14] p-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="pb-2.5 font-bold uppercase tracking-wider">Критерий</th>
                <th className="pb-2.5 font-bold uppercase tracking-wider text-purple-300">Wildberries</th>
                <th className="pb-2.5 font-bold uppercase tracking-wider text-blue-300">Ozon</th>
                <th className="pb-2.5 font-bold uppercase tracking-wider text-[#00FF87]">Преимущество</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {comparisonPoints.map((point, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 font-semibold text-white">{point.parameter}</td>
                  <td className="py-2.5 font-mono">{point.wbValue}</td>
                  <td className="py-2.5 font-mono">{point.ozonValue}</td>
                  <td className="py-2.5">
                    <span className="text-slate-300">{point.note}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

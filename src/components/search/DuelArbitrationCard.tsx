"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ChevronDown,
  ShoppingBag,
  ShieldCheck,
  TrendingDown,
  Star,
} from "lucide-react";
import { DuelArbitration } from "@/lib/catalog/duel-matrix";

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
    comparisonPoints,
  } = duel;

  const wbLink = `/product/${wbSlot.product.id}${query ? `?fromQuery=${encodeURIComponent(query)}` : ""}`;
  const ozonLink = `/product/${ozonSlot.product.id}${query ? `?fromQuery=${encodeURIComponent(query)}` : ""}`;

  const isWbWinner = bestOverallPick === "wildberries";
  const isOzonWinner = bestOverallPick === "ozon";

  // Угол наклона коромысла весов (перевес в пользу победителя)
  const beamRotation = isWbWinner ? "-rotate-6 sm:-rotate-8" : isOzonWinner ? "rotate-6 sm:rotate-8" : "rotate-0";

  return (
    <section className="relative my-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#161922] via-[#111319] to-[#0D0F14] p-4 shadow-2xl backdrop-blur-xl sm:p-7">
      {/* Декоративное фоновое свечение */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-purple-600/10 blur-[90px]" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-600/10 blur-[90px]" />

      {/* 1. ОЦЕНОЧНЫЕ СОЕДИНИТЕЛЬНЫЕ ЛИНИИ АНАЛИТИКИ ОТ ВЕРХНЕГО ЯРУСА */}
      <div className="relative mb-4 hidden sm:block">
        <div className="flex items-center justify-between px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-1.5 text-purple-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_6px_#c084fc]" />
            <span>Анализ Слот 1 (Wildberries)</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#00FF87]/30 bg-[#00FF87]/10 px-3 py-0.5 text-[#00FF87] shadow-[0_0_10px_rgba(0,255,135,0.2)]">
            <Scale className="h-3 w-3" />
            <span>Синхронный арбитраж дуэли wobuy.</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-300">
            <span>Анализ Слот 2 (Ozon)</span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_6px_#60a5fa]" />
          </div>
        </div>

        {/* Пунктирные неоновые потоки данных к арбитру */}
        <div className="relative mt-2 h-7 w-full overflow-hidden">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 800 28">
            <path
              d="M 120 0 C 220 24, 340 26, 395 26"
              fill="none"
              stroke="rgba(192, 132, 252, 0.5)"
              strokeWidth="2"
              strokeDasharray="5 3"
            />
            <path
              d="M 680 0 C 580 24, 460 26, 405 26"
              fill="none"
              stroke="rgba(96, 165, 250, 0.5)"
              strokeWidth="2"
              strokeDasharray="5 3"
            />
            <circle cx="400" cy="26" r="3.5" fill="#00FF87" className="animate-ping" />
            <circle cx="400" cy="26" r="3.5" fill="#00FF87" />
          </svg>
        </div>
      </div>

      {/* 2. ВЕРДИКТ АРБИТРА (АГЕНТ СКЕПТИК) — ЯВНО ВВЕРХУ НАД ВЕСАМИ */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-[#12151B] to-purple-950/30 p-4 shadow-xl sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#00FF87]/40 bg-[#00FF87]/15 text-[#00FF87] shadow-[0_0_15px_rgba(0,255,135,0.3)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                  Вердикт арбитра (Агент Скептик)
                </span>
                <span className="rounded-full bg-[#00FF87] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-md">
                  🏆 Выиграл {isWbWinner ? "Wildberries" : "Ozon"}
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm font-medium leading-relaxed text-slate-200">
                {skepticVerdict}
              </p>
            </div>
          </div>

          {/* Плашка выигрыша по цене */}
          {priceDiff > 0 && (
            <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-2 sm:flex-col sm:items-end sm:text-right">
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <TrendingDown className="h-3.5 w-3.5" />
                <span>Чистая выгода</span>
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                +{priceDiff.toLocaleString("ru-RU")} ₽
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. БОЛЬШИЕ ДУЭЛЬНЫЕ ВЕСЫ И КОМПАКТНЫЕ КАРТОЧКИ СЛОТОВ */}
      <div className="relative mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Карточка WB (Компактная, слева) */}
        <div
          className={`flex flex-col justify-between rounded-2xl border p-3.5 transition-all duration-300 lg:w-[28%] ${
            isWbWinner
              ? "border-purple-500/50 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.2)] ring-1 ring-purple-500/30"
              : "border-white/10 bg-[#0D0F14]/80 opacity-90"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-950/70 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-300">
                Wildberries
              </span>
              {isWbWinner && (
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-400">
                  🏆 Выбор арбитра
                </span>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-2.5">
              <img
                src={wbSlot.product.imageUrl}
                alt={wbSlot.product.title}
                onError={(e) => {
                  const el = e.currentTarget;
                  if (el.src.includes("/1.webp")) el.src = el.src.replace("/1.webp", "/2.webp");
                }}
                className="h-12 w-12 shrink-0 rounded-xl object-cover border border-white/10"
              />
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase text-slate-400 truncate">
                  {wbSlot.product.brand}
                </div>
                <h4 className="line-clamp-1 text-xs font-bold text-white">
                  {wbSlot.product.title}
                </h4>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-black text-purple-300">
                    {wbSlot.tcoPrice.toLocaleString("ru-RU")} ₽
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    {wbSlot.matchedOffer.rating && wbSlot.matchedOffer.rating > 0 ? wbSlot.matchedOffer.rating.toFixed(1) : "4.9"}
                  </span>
                  {wbSlot.matchedOffer.reviewCount ? (
                    <span className="text-[10px] text-slate-400">
                      ({wbSlot.matchedOffer.reviewCount.toLocaleString("ru-RU")})
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-white/5 pt-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-300 mb-2">
              <span className="text-slate-400">Срок:</span>
              <span className="font-semibold text-white">{wbSlot.deliverySpeedLabel}</span>
            </div>

            <div className="flex gap-2">
              <a
                href={wbSlot.matchedOffer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-purple-500/40 bg-purple-950/40 py-2 text-[11px] font-bold text-purple-200 transition hover:bg-purple-900/60"
              >
                <ShoppingBag className="h-3 w-3" />
                <span>На WB</span>
              </a>
              <Link
                href={wbLink}
                className="flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] font-bold text-white transition hover:border-[#00FF87]/40 hover:bg-white/10"
              >
                <span>Разбор в</span>
                <span className="font-black text-[#00FF87]">wobuy.</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ЦЕНТРАЛЬНЫЕ БОЛЬШИЕ ДУЭЛЬНЫЕ ВЕСЫ */}
        <div className="relative flex flex-1 flex-col items-center justify-center py-2 lg:px-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Дуэльные весы маркетплейсов
          </div>

          {/* Визуальная конструкция весов */}
          <div className="relative flex w-full max-w-sm flex-col items-center">
            {/* Опорный шарнир и коромысло */}
            <div className="relative flex h-20 w-full items-center justify-center">
              {/* Центральная стойка весов */}
              <div className="absolute top-2 h-14 w-1.5 rounded-full bg-gradient-to-b from-[#00FF87] via-slate-600 to-slate-800" />
              <div className="absolute top-1 h-3.5 w-3.5 rounded-full border-2 border-[#00FF87] bg-black shadow-[0_0_10px_#00FF87]" />

              {/* Наклонное коромысло весов */}
              <div
                className={`relative flex w-full items-center justify-between px-2 transition-transform duration-700 ease-out ${beamRotation}`}
              >
                {/* Коромысло-балка */}
                <div className="absolute left-4 right-4 h-1.5 rounded-full bg-gradient-to-r from-purple-500 via-slate-400 to-blue-500 shadow-md" />

                {/* ЛЕВАЯ ЧАША ВЕСОВ (Wildberries) */}
                <div
                  className={`relative flex flex-col items-center transition-transform duration-500 ${
                    isWbWinner ? "translate-y-3" : isOzonWinner ? "-translate-y-2" : ""
                  }`}
                >
                  <div className="h-5 w-0.5 bg-purple-400/60" />
                  <div
                    className={`flex flex-col items-center justify-center rounded-2xl border px-3 py-2 shadow-xl transition-all ${
                      isWbWinner
                        ? "border-purple-500 bg-purple-950/80 shadow-[0_0_20px_rgba(168,85,247,0.4)] ring-1 ring-purple-400"
                        : "border-white/10 bg-[#0D0F14]/90"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs">🟣</span>
                      <span className="text-[10px] font-black uppercase text-purple-300">WB</span>
                      {isWbWinner && <span className="text-[11px]">👑</span>}
                    </div>
                    <span className="mt-0.5 text-xs font-black text-white">
                      {wbSlot.tcoPrice.toLocaleString("ru-RU")} ₽
                    </span>
                    <span
                      className={`mt-0.5 text-[8px] font-black uppercase tracking-wider ${
                        isWbWinner ? "text-[#00FF87]" : "text-slate-400"
                      }`}
                    >
                      {isWbWinner ? "★ ВЫИГРАЛ" : "УСТУПАЕТ"}
                    </span>
                  </div>
                </div>

                {/* ИНДИКАТОР ПЕРЕВЕСА В ЦЕНТРЕ */}
                <div className="z-10 flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[#0D0F14] text-[10px] font-black text-[#00FF87] shadow-[0_0_12px_rgba(0,255,135,0.3)]">
                    VS
                  </div>
                </div>

                {/* ПРАВАЯ ЧАША ВЕСОВ (Ozon) */}
                <div
                  className={`relative flex flex-col items-center transition-transform duration-500 ${
                    isOzonWinner ? "translate-y-3" : isWbWinner ? "-translate-y-2" : ""
                  }`}
                >
                  <div className="h-5 w-0.5 bg-blue-400/60" />
                  <div
                    className={`flex flex-col items-center justify-center rounded-2xl border px-3 py-2 shadow-xl transition-all ${
                      isOzonWinner
                        ? "border-blue-500 bg-blue-950/80 shadow-[0_0_20px_rgba(59,130,246,0.4)] ring-1 ring-blue-400"
                        : "border-white/10 bg-[#0D0F14]/90"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs">🔵</span>
                      <span className="text-[10px] font-black uppercase text-blue-300">Ozon</span>
                      {isOzonWinner && <span className="text-[11px]">👑</span>}
                    </div>
                    <span className="mt-0.5 text-xs font-black text-white">
                      {ozonSlot.tcoPrice.toLocaleString("ru-RU")} ₽
                    </span>
                    <span
                      className={`mt-0.5 text-[8px] font-black uppercase tracking-wider ${
                        isOzonWinner ? "text-[#00FF87]" : "text-slate-400"
                      }`}
                    >
                      {isOzonWinner ? "★ ВЫИГРАЛ" : "УСТУПАЕТ"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Основание весов */}
            <div className="mt-1 h-1.5 w-16 rounded-full bg-slate-700" />
          </div>

          {/* Текстовая сводка перевеса */}
          <div className="mt-3 text-center">
            <div className="text-xs font-black text-[#00FF87]">
              {cheaperSummary}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-400">
              {fasterSummary}
            </div>
          </div>
        </div>

        {/* Карточка Ozon (Компактная, справа) */}
        <div
          className={`flex flex-col justify-between rounded-2xl border p-3.5 transition-all duration-300 lg:w-[28%] ${
            isOzonWinner
              ? "border-blue-500/50 bg-blue-950/20 shadow-[0_0_20px_rgba(59,130,246,0.2)] ring-1 ring-blue-500/30"
              : "border-white/10 bg-[#0D0F14]/80 opacity-90"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-950/70 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-300">
                Ozon
              </span>
              {isOzonWinner && (
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-400">
                  🏆 Выбор арбитра
                </span>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-2.5">
              <img
                src={ozonSlot.product.imageUrl}
                alt={ozonSlot.product.title}
                onError={(e) => {
                  const el = e.currentTarget;
                  if (el.src.includes("/1.webp")) el.src = el.src.replace("/1.webp", "/2.webp");
                }}
                className="h-12 w-12 shrink-0 rounded-xl object-cover border border-white/10"
              />
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase text-slate-400 truncate">
                  {ozonSlot.product.brand}
                </div>
                <h4 className="line-clamp-1 text-xs font-bold text-white">
                  {ozonSlot.product.title}
                </h4>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-black text-blue-300">
                    {ozonSlot.tcoPrice.toLocaleString("ru-RU")} ₽
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    {ozonSlot.matchedOffer.rating && ozonSlot.matchedOffer.rating > 0 ? ozonSlot.matchedOffer.rating.toFixed(1) : "4.8"}
                  </span>
                  {ozonSlot.matchedOffer.reviewCount ? (
                    <span className="text-[10px] text-slate-400">
                      ({ozonSlot.matchedOffer.reviewCount.toLocaleString("ru-RU")})
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-white/5 pt-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-300 mb-2">
              <span className="text-slate-400">Срок:</span>
              <span className="font-semibold text-white">{ozonSlot.deliverySpeedLabel}</span>
            </div>

            <div className="flex gap-2">
              <a
                href={ozonSlot.matchedOffer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-blue-500/40 bg-blue-950/40 py-2 text-[11px] font-bold text-blue-200 transition hover:bg-blue-900/60"
              >
                <ShoppingBag className="h-3 w-3" />
                <span>На Ozon</span>
              </a>
              <Link
                href={ozonLink}
                className="flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] font-bold text-white transition hover:border-[#00FF87]/40 hover:bg-white/10"
              >
                <span>Разбор в</span>
                <span className="font-black text-[#00FF87]">wobuy.</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. КНОПКА РАСКРЫТИЯ ДЕТАЛЬНОГО СРАВНЕНИЯ ПАРАМЕТРОВ */}
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-[#00FF87]/40 hover:bg-white/10 hover:text-white"
        >
          <span>{isExpanded ? "Скрыть таблицу параметров" : "Сравнить параметры дуэли (TCO, доставка, возврат)"}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Детальная таблица сравнения при раскрытии */}
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

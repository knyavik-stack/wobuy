"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ExternalLink,
  ChevronDown,
  Check,
  Clock,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { DuelArbitration } from "@/lib/catalog/duel-matrix";

interface DuelArbitrationCardProps {
  duel: DuelArbitration;
}

export function DuelArbitrationCard({ duel }: DuelArbitrationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    isSameSku,
    wbSlot,
    ozonSlot,
    priceDiff,
    cheaperMarketplace,
    cheaperSummary,
    fasterSummary,
    skepticVerdict,
    bestOverallPick,
    comparisonPoints,
  } = duel;

  return (
    <section className="relative my-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#161922] to-[#101218] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
      {/* Декоративное свечение */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-purple-600/10 blur-[90px]" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-600/10 blur-[90px]" />

      {/* Верхняя панель: Заголовок и статус связки */}
      <div className="relative flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 shadow-inner">
            <Scale className="h-5 w-5 text-[#00FF87]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black uppercase tracking-wider text-white sm:text-base">
                Дуэльные весы маркетплейсов
              </span>
              <span className="rounded-full bg-[#00FF87]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#00FF87]">
                Арбитраж Скептика
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-300">
              {isSameSku
                ? "🎯 Один и тот же проверенный товар на Wildberries и Ozon. Честное сравнение цен и скорости."
                : "⚡ Битва лидеров категории на Wildberries и Ozon по оценке ИИ wobuy."}
            </p>
          </div>
        </div>

        {/* Бейдж совпадения SKU */}
        <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 sm:self-auto">
          {isSameSku ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#00FF87]" />
              <span>Совпадение SKU: 100%</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Лидеры двух площадок</span>
            </>
          )}
        </div>
      </div>

      {/* Центральная часть: Интерактивные дуэльные весы WB vs Ozon */}
      <div className="relative mt-6 grid grid-cols-1 gap-4 lg:grid-cols-7 lg:items-center">
        {/* Карточка WB (Слева, 3 колонки) */}
        <div
          className={`flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 lg:col-span-3 ${
            bestOverallPick === "wildberries"
              ? "border-purple-500/50 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
              : "border-white/10 bg-[#0D0F14]/70"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-950/60 px-2.5 py-0.5 text-[11px] font-black uppercase text-purple-300">
                Wildberries
              </span>
              {cheaperMarketplace === "wildberries" && (
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-400">
                  Дешевле на {priceDiff.toLocaleString("ru-RU")} ₽
                </span>
              )}
            </div>

            <div className="mt-3 flex gap-3">
              <img
                src={wbSlot.product.imageUrl}
                alt={wbSlot.product.title}
                className="h-16 w-16 shrink-0 rounded-xl object-cover border border-white/10"
              />
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase text-slate-400 truncate">
                  {wbSlot.product.brand}
                </div>
                <h4 className="line-clamp-2 text-xs font-bold text-white">
                  {wbSlot.product.title}
                </h4>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-white/5 pt-3">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[10px] font-extrabold uppercase text-slate-400">
                  Честная цена TCO:
                </div>
                <div className="text-xl font-black text-purple-300">
                  {wbSlot.tcoPrice.toLocaleString("ru-RU")} ₽
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-300">
                <div className="flex items-center justify-end gap-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>Доставка:</span>
                </div>
                <div className="font-bold text-white">{wbSlot.deliverySpeedLabel}</div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <a
                href={wbSlot.matchedOffer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 py-2 text-xs font-bold text-purple-200 transition hover:bg-purple-900/60"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>На WB</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
              <Link
                href={`/product/${wbSlot.product.id}`}
                className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10"
              >
                Разбор
              </Link>
            </div>
          </div>
        </div>

        {/* Центр: Индикатор сравнения и перевеса (1 колонка) */}
        <div className="flex flex-col items-center justify-center py-2 lg:col-span-1">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#0D0F14] shadow-lg">
            <span className="text-xs font-black tracking-widest text-[#00FF87]">VS</span>
          </div>

          <div className="mt-2 text-center">
            <div className="text-[11px] font-extrabold text-[#00FF87]">
              {cheaperSummary}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-400">
              {fasterSummary}
            </div>
          </div>
        </div>

        {/* Карточка Ozon (Справа, 3 колонки) */}
        <div
          className={`flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 lg:col-span-3 ${
            bestOverallPick === "ozon"
              ? "border-blue-500/50 bg-blue-950/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
              : "border-white/10 bg-[#0D0F14]/70"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-950/60 px-2.5 py-0.5 text-[11px] font-black uppercase text-blue-300">
                Ozon
              </span>
              {cheaperMarketplace === "ozon" && (
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-400">
                  Дешевле на {priceDiff.toLocaleString("ru-RU")} ₽
                </span>
              )}
            </div>

            <div className="mt-3 flex gap-3">
              <img
                src={ozonSlot.product.imageUrl}
                alt={ozonSlot.product.title}
                className="h-16 w-16 shrink-0 rounded-xl object-cover border border-white/10"
              />
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase text-slate-400 truncate">
                  {ozonSlot.product.brand}
                </div>
                <h4 className="line-clamp-2 text-xs font-bold text-white">
                  {ozonSlot.product.title}
                </h4>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-white/5 pt-3">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[10px] font-extrabold uppercase text-slate-400">
                  Честная цена TCO:
                </div>
                <div className="text-xl font-black text-blue-300">
                  {ozonSlot.tcoPrice.toLocaleString("ru-RU")} ₽
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-300">
                <div className="flex items-center justify-end gap-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>Доставка:</span>
                </div>
                <div className="font-bold text-white">{ozonSlot.deliverySpeedLabel}</div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <a
                href={ozonSlot.matchedOffer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-950/40 py-2 text-xs font-bold text-blue-200 transition hover:bg-blue-900/60"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>На Ozon</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
              <Link
                href={`/product/${ozonSlot.product.id}`}
                className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10"
              >
                Разбор
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Вердикт Скептика-арбитра */}
      <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-[#0D0F14] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-950/60 text-base border border-purple-500/40">
            🛡️
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                Вердикт арбитра (Агент Скептик)
              </span>
              <span className="text-[10px] text-slate-400">
                • Выбор: {bestOverallPick === "wildberries" ? "Wildberries" : "Ozon"}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-200">
              {skepticVerdict}
            </p>
          </div>
        </div>
      </div>

      {/* Кнопка раскрытия детального сравнения */}
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          <span>{isExpanded ? "Скрыть таблицу параметров" : "Сравнить параметры дуэли (TCO, доставка, возврат)"}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
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

"use client";

import React, { useState } from "react";
import { Calculator, ShieldCheck, Truck, HelpCircle, CheckCircle2 } from "lucide-react";
import type { TcoBreakdown } from "@/lib/ai/analyzer";

interface TcoCalculatorCardProps {
  tco: TcoBreakdown | undefined;
  currency?: string;
  brand?: string;
}

export function TcoCalculatorCard({
  tco,
  currency = "RUB",
}: TcoCalculatorCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!tco) return null;

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div
      id="product-tco-calculator"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#12151B] p-6 shadow-xl"
    >
      {/* Шапка карточки */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-950/40 text-[#00FF87]">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white sm:text-base">
              Калькулятор честной стоимости покупки (TCO)
            </h3>
            <p className="text-xs text-slate-400">
              Расчет Агента 4 (Scorer): чистая цена без скрытых сборов и платных возвратов
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 transition hover:text-[#00FF87] self-start sm:self-auto"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Как считается TCO?</span>
        </button>
      </div>

      {showTooltip && (
        <div className="mt-4 rounded-2xl border border-[#00FF87]/20 bg-[#0D0F14] p-4 text-xs leading-relaxed text-slate-300">
          <strong className="text-white">TCO (Total Cost of Ownership) в wobuy<span className="text-[#00FF87] drop-shadow-[0_0_8px_#00FF87]">.</span></strong> — это итоговая сумма, которую вы реально заплатите. Мы исключаем навязанные платные подписки, проверяем платность обратной логистики в ваш ПВЗ при отказе и закладываем коэффициент риска брака на основе реальных отзывов.
        </div>
      )}

      {/* Структура калькулятора */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Базовая цена */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-[#0D0F14] p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Базовая цена на МП</span>
            <span className="text-[10px] text-slate-500">ценник</span>
          </div>
          <div className="mt-2 text-xl font-black text-white">
            {formatMoney(tco.basePrice)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Без наценок</span>
          </div>
        </div>

        {/* Логистика до ПВЗ */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-[#0D0F14] p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Доставка до вашего ПВЗ</span>
            <Truck className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-black text-[#00FF87]">
            {tco.deliveryCost === 0 ? "0 ₽" : formatMoney(tco.deliveryCost)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Бесплатный самовывоз в пункте
          </div>
        </div>

        {/* Риск возврата и брака */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-[#0D0F14] p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Риск брака / возврата</span>
            <ShieldCheck className="h-3.5 w-3.5 text-[#00FF87]" />
          </div>
          <div className={`mt-2 text-xl font-black ${tco.returnRiskCost === 0 ? "text-[#00FF87]" : "text-amber-400"}`}>
            {tco.returnRiskCost === 0 ? "0 ₽" : `+${formatMoney(tco.returnRiskCost)}`}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {tco.returnRiskCost === 0 ? "Надежная партия, 0% брака" : "Риск платной обратной доставки"}
          </div>
        </div>
      </div>

      {/* Итоговая полоса честной цены */}
      <div className="mt-4 flex flex-col justify-between gap-3 rounded-2xl border border-[#00FF87]/30 bg-emerald-950/20 p-4 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-slate-300">
            Итоговый TCO-индекс честной покупки:
          </div>
          <p className="text-xs text-slate-400">{tco.note}</p>
        </div>

        <div className="flex items-baseline gap-2 shrink-0">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Честная стоимость:
          </span>
          <span className="text-2xl font-black text-[#00FF87] sm:text-3xl">
            {formatMoney(tco.totalTco)}
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, XCircle, EyeOff } from "lucide-react";
import type { FomoAlternative } from "@/lib/ai/analyzer";

interface FomoAlternativesDrawerProps {
  alternatives: FomoAlternative[] | undefined;
}

export function FomoAlternativesDrawer({ alternatives }: FomoAlternativesDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div
      id="product-fomo-alternatives"
      className="rounded-3xl border border-white/10 bg-[#12151B] p-6 shadow-xl transition"
    >
      {/* Кнопка-шторка */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 text-left transition"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/40 text-red-400">
            <EyeOff className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white sm:text-base">
                Убийца FOMO: Почему ИИ отбросил другие варианты?
              </h3>
              <span className="rounded-full border border-red-500/30 bg-red-900/40 px-2.5 py-0.5 text-[10px] font-bold text-red-300">
                {alternatives.length} отсеянных позиции
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Показываем, от каких мнимо дешевых покупок с накрученными отзывами wobuy<span className="text-[#00FF87] drop-shadow-[0_0_8px_#00FF87]">.</span> вас уберег
            </p>
          </div>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#0D0F14] text-slate-300 transition hover:text-white shrink-0">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {/* Раскрывающийся контент */}
      {isOpen && (
        <div className="mt-6 space-y-4 border-t border-white/5 pt-5">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-3.5 text-xs text-amber-300 leading-relaxed">
            ⚠️ <strong>Принцип честности wobuy<span className="text-[#00FF87] drop-shadow-[0_0_8px_#00FF87]">.</span>:</strong> Эти товары часто стоят дешевле на маркетплейсах, но наши ИИ-агенты дисквалифицировали их из топа из-за скрытых рисков (боты, высокий процент брака, завышенные сроки доставки).
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-red-500/20 bg-[#0D0F14] p-4.5 transition hover:border-red-500/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xs font-bold text-slate-200 sm:text-sm">
                      {alt.title}
                    </h4>
                    <span className="rounded-md border border-red-500/30 bg-red-950/50 px-2 py-0.5 text-[11px] font-black text-red-400 shrink-0">
                      ~{alt.price.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-red-400">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Дисквалифицировано Агентом Скептиком</span>
                  </div>

                  <div className="mt-3 rounded-xl border border-white/5 bg-[#12151B] p-3 text-xs leading-relaxed text-slate-300">
                    <strong className="text-red-300">Причина отбраковки:</strong>{" "}
                    {alt.reasonRejected}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-500">
                  <span>Статус: Отклонено алгоритмом</span>
                  <span className="text-white font-bold">✓ wobuy<span className="text-[#00FF87] drop-shadow-[0_0_8px_#00FF87]">.</span> защитил от покупки</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

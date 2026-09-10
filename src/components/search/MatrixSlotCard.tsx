"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { MatrixSlot } from "@/lib/catalog/duel-matrix";
import { ProductGallery } from "@/components/product/ProductGallery";
import { NeonScoreCircle } from "@/components/ui/NeonScoreCircle";

interface MatrixSlotCardProps {
  slot: MatrixSlot;
  view?: "grid" | "list";
  query?: string;
}

export function MatrixSlotCard({ slot, view = "grid", query }: MatrixSlotCardProps) {
  const [whyOpen, setWhyOpen] = useState(false);
  const {
    slotType,
    badgeTitle,
    badgeSubtitle,
    badgeColor,
    badgeBg,
    badgeBorder,
    product,
    matchedOffer,
    tcoPrice,
    deliverySpeedLabel,
    aiVerdict,
    pros,
    cons,
    antiFakePercent,
    savingsVsMarketText,
    tcoBreakdown,
  } = slot;

  const marketplaceName = matchedOffer.marketplace.toLowerCase().includes("wildberries")
    ? "Wildberries"
    : "Ozon";

  const productLinkParams = new URLSearchParams();
  if (query) productLinkParams.set("fromQuery", query);
  productLinkParams.set("fromSlot", slotType);
  productLinkParams.set("slotTitle", badgeTitle);
  productLinkParams.set("slotMarketplace", marketplaceName);
  const productLink = `/product/${product.id}?${productLinkParams.toString()}`;

  const aiScore = product.aiScore || 9.4;
  const scoreGlow =
    slotType === "wb_champion"
      ? "purple"
      : slotType === "ozon_champion"
        ? "blue"
        : slotType === "express"
          ? "amber"
          : "emerald";

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border ${badgeBorder} bg-[#12151B] p-5 shadow-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,135,0.1)] ${
        view === "list" ? "md:flex-row md:gap-6" : ""
      }`}
    >
      {/* Верхний статус-бейдж слота + Неоновый круг с баллом анализа */}
      <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${badgeBorder} ${badgeBg} ${badgeColor}`}
          >
            {slotType === "wb_champion" && <span>🟣</span>}
            {slotType === "ozon_champion" && <span>🔵</span>}
            {slotType === "economist" && <span>🏷️</span>}
            {slotType === "express" && <span>⚡</span>}
            <span>{badgeTitle}</span>
          </div>

          {(slotType === "economist" || slotType === "express") && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                marketplaceName === "Wildberries"
                  ? "border border-purple-500/40 bg-purple-950/60 text-purple-300"
                  : "border border-blue-500/40 bg-blue-950/60 text-blue-300"
              }`}
            >
              на {marketplaceName}
            </span>
          )}

          <span className="hidden sm:inline text-xs font-semibold text-slate-300">
            {badgeSubtitle}
          </span>
        </div>

        {/* Неоновый круг с баллом ИИ + Плашка Анти-Фейк */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-950/40 px-2.5 py-0.5 text-[11px] font-bold text-purple-300">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            <span>Траст: {antiFakePercent}%</span>
          </div>

          <div className="flex items-center gap-2">
            <NeonScoreCircle
              score={aiScore}
              size="sm"
              label="БАЛЛ"
              glowColor={scoreGlow}
            />
          </div>
        </div>
      </div>

      {/* Основная часть: Галерея фото и информация */}
      <div className={`flex flex-col gap-4 sm:flex-row ${view === "list" ? "md:w-3/5" : ""}`}>
        {/* Фото товара */}
        <div className="sm:w-44 sm:shrink-0">
          <ProductGallery
            images={product.images || [product.imageUrl]}
            title={product.title}
            marketplace={matchedOffer.marketplace}
            isCompact={true}
          />
        </div>

        {/* Название, бренд, цены и доставка */}
        <div className="flex flex-1 min-w-0 flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {product.brand}
              </span>
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                {marketplaceName}
              </span>
            </div>

            <Link href={`/product/${product.id}`} className="block mt-1">
              <h3 className="line-clamp-2 text-sm font-black text-white transition group-hover:text-[#00FF87] sm:text-base">
                {product.title}
              </h3>
            </Link>

            {/* Блок цены TCO */}
            <div className="mt-3 rounded-2xl border border-white/5 bg-[#0D0F14] p-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-400">
                    Честная цена (TCO):
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black text-[#00FF87] sm:text-2xl">
                      {tcoPrice.toLocaleString("ru-RU")} ₽
                    </span>
                    {matchedOffer.price && matchedOffer.price !== tcoPrice && (
                      <span className="text-xs line-through text-slate-500">
                        {matchedOffer.price.toLocaleString("ru-RU")} ₽
                      </span>
                    )}
                  </div>
                </div>

                {savingsVsMarketText ? (
                  <span className="rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-bold text-emerald-400">
                    {savingsVsMarketText}
                  </span>
                ) : product.discountPercent > 0 ? (
                  <span className="rounded-lg bg-[#00FF87]/15 px-2 py-1 text-[11px] font-bold text-[#00FF87]">
                    -{product.discountPercent}%
                  </span>
                ) : null}
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-300">
                <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold text-white">{deliverySpeedLabel}</span>
              </div>
            </div>

            {/* Краткий вердикт ИИ */}
            <p className="mt-2.5 text-xs text-slate-300 line-clamp-2">
              {aiVerdict}
            </p>
          </div>

          {/* Кнопка раскрытия "Почему этот выбор?" */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setWhyOpen(!whyOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#00FF87]" />
                <span>Почему этот выбор? (Аудит ИИ)</span>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  whyOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Выпадающий блок полного аудита ИИ */}
      {whyOpen && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0D0F14] p-4 text-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Плюсы */}
            <div>
              <div className="font-bold text-emerald-400 mb-1.5 uppercase tracking-wider text-[10px]">
                Доказанные преимущества:
              </div>
              <ul className="space-y-1 text-slate-300">
                {pros.map((pro, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Нюансы и TCO */}
            <div>
              <div className="font-bold text-amber-400 mb-1.5 uppercase tracking-wider text-[10px]">
                Честный нюанс:
              </div>
              <ul className="space-y-1 text-slate-300">
                {cons.map((con, cIdx) => (
                  <li key={cIdx} className="flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-2 border-t border-white/5 pt-2 text-[11px] text-slate-400">
                <span>Базовая цена: {tcoBreakdown.basePrice} ₽</span>
                {tcoBreakdown.loyaltyDiscount > 0 && (
                  <span className="text-emerald-400"> • Скидка по карте: -{tcoBreakdown.loyaltyDiscount} ₽</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Кнопки действий */}
      <div
        className={`mt-4 flex flex-col gap-2 border-t border-white/5 pt-3.5 ${
          view === "list" ? "md:mt-0 md:w-2/5 md:border-l md:border-t-0 md:pl-6 md:pt-0" : ""
        }`}
      >
        <div className="flex gap-2">
          {/* Переход на маркетплейс */}
          <a
            href={matchedOffer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white transition hover:border-white/20 hover:bg-white/10"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
            <span>На {marketplaceName}</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>

          {/* Фирменная кнопка wobuy. */}
          <Link
            href={productLink}
            className="group/btn relative flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#00FF87] bg-[#12151B] py-3 text-xs font-extrabold text-white shadow-[0_0_12px_rgba(0,255,135,0.15)] transition-all duration-300 hover:bg-[#00FF87] hover:text-black hover:shadow-[0_0_20px_rgba(0,255,135,0.5)]"
          >
            <span>Разбор в</span>
            <span className="font-black text-[#00FF87] transition-colors group-hover/btn:text-black">
              wobuy.
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_6px_#00FF87] transition-colors group-hover/btn:bg-black group-hover/btn:shadow-none" />
          </Link>
        </div>
      </div>
    </article>
  );
}

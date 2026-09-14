"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  ShieldCheck,
  Zap,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  TrendingDown,
} from "lucide-react";
import type { MatrixSlot, DuelArbitration } from "@/lib/catalog/duel-matrix";
import { NeonScoreCircle } from "@/components/ui/NeonScoreCircle";
import { NeonDot } from "@/components/brand/WobuyDot";
import { sanitizeMarketplaceOfferUrl } from "@/lib/marketplace-links";
import { MarketplaceBadge } from "@/components/ui/MarketplaceBadge";

interface AbsoluteChampionBlockProps {
  champion: MatrixSlot;
  duel: DuelArbitration;
  query?: string;
}

export function AbsoluteChampionBlock({
  champion,
  duel,
  query,
}: AbsoluteChampionBlockProps) {
  const {
    product,
    matchedOffer,
    tcoPrice,
    deliverySpeedLabel,
    antiFakePercent,
    pros,
  } = champion;

  const isWb = matchedOffer.marketplace.toLowerCase().includes("wildberries");
  const marketplaceName = isWb ? "Wildberries" : "Ozon";

  const safeOfferUrl = sanitizeMarketplaceOfferUrl(
    matchedOffer.marketplace,
    matchedOffer.url,
    product.title,
  );

  const productLinkParams = new URLSearchParams();
  if (query) productLinkParams.set("fromQuery", query);
  productLinkParams.set("fromSlot", champion.slotType);
  productLinkParams.set("slotTitle", "Абсолютный Чемпион");
  productLinkParams.set("slotMarketplace", marketplaceName);
  if (matchedOffer.price) productLinkParams.set("price", String(matchedOffer.price));
  if (tcoPrice) productLinkParams.set("tcoPrice", String(tcoPrice));
  if (safeOfferUrl) productLinkParams.set("offerUrl", safeOfferUrl);
  const internalAuditLink = `/product/${product.id}?${productLinkParams.toString()}`;

  const championScore = product.aiScore || (isWb ? duel.wbArbitrationScore : duel.ozonArbitrationScore) || 9.8;
  const imageSrc = (product.images && product.images[0]) || product.imageUrl || "/placeholder.png";

  return (
    <section
      id="wobuy-absolute-champion"
      className="relative overflow-hidden rounded-3xl border border-[#00FF87]/40 bg-gradient-to-br from-[#131720] via-[#0E1117] to-[#0D1612] p-5 sm:p-7 shadow-[0_0_40px_rgba(0,255,135,0.12)] transition-all"
    >
      {/* Фоновые неоновые всплески */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#00FF87]/10 blur-[100px]" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />

      {/* Верхняя статусная панель блока */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00FF87]/40 bg-[#00FF87]/15 px-3 py-1 text-xs font-black text-[#00FF87]">
            <Award className="h-3.5 w-3.5" />
            <span>АБСОЛЮТНЫЙ ЧЕМПИОН</span>
            <span className="text-white/40">•</span>
            <span className="text-white">Выбор wobuy<NeonDot size="xs" /></span>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-bold text-slate-300">
            Готовый ответ за 1 секунду
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-[#00FF87]" />
          <span>Победитель дуэли Wildberries vs Ozon</span>
        </div>
      </div>

      {/* Основной контентный монолит */}
      <div className="relative z-10 mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
        {/* Фото товара и бейдж маркетплейса */}
        <div className="relative flex justify-center lg:col-span-4">
          <div className="relative h-60 w-full max-w-sm sm:h-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0D12] shadow-xl">
            <Image
              src={imageSrc}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 350px"
              className="object-contain p-3 transition duration-500 hover:scale-105"
              referrerPolicy="no-referrer"
              priority
            />

            {/* Маркетплейс-бейдж на фото */}
            <div className="absolute left-3 top-3">
              <MarketplaceBadge
                marketplace={matchedOffer.marketplace}
                size="md"
                showLabel={true}
              />
            </div>

            {/* Бейдж траста на фото */}
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-purple-500/40 bg-purple-950/80 px-2.5 py-1 text-[11px] font-extrabold text-purple-300 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              <span>{antiFakePercent}% траст</span>
            </div>
          </div>
        </div>

        {/* Центральный блок: Заголовок, вердикт за 1 секунду и факты */}
        <div className="flex flex-col justify-between lg:col-span-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="text-white font-extrabold">{product.brand || "Оригинал"}</span>
              <span>•</span>
              <span>{product.category || "Каталог"}</span>
            </div>

            <h2 className="mt-1.5 text-lg sm:text-xl font-black text-white leading-snug">
              {product.title}
            </h2>

            {/* Блок-вердикт за 1 секунду */}
            <div className="mt-3.5 rounded-2xl border border-[#00FF87]/30 bg-black/40 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00FF87]">
                <Zap className="h-4 w-4 fill-[#00FF87]" />
                <span>Вердикт ИИ wobuy<NeonDot size="xs" />:</span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm font-medium leading-relaxed text-slate-200">
                {duel.decisiveFactorLabel || duel.skepticVerdict}
              </p>
              {pros && pros.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-white/5 pt-2">
                  {pros.slice(0, 2).map((pro, pIdx) => (
                    <span
                      key={pIdx}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300"
                    >
                      <span className="text-[#00FF87] font-bold">✓</span> {pro}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 3 ключевых фактора честности */}
            <div className="mt-3.5 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
                  <TrendingDown className="h-3 w-3 text-emerald-400" />
                  <span>TCO Цена</span>
                </div>
                <div className="mt-1 text-xs sm:text-sm font-black text-white">
                  {tcoPrice.toLocaleString("ru-RU")} ₽
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
                  <Clock className="h-3 w-3 text-amber-400" />
                  <span>Доставка FBO</span>
                </div>
                <div className="mt-1 text-xs sm:text-sm font-black text-white">
                  {deliverySpeedLabel}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
                  <ShieldCheck className="h-3 w-3 text-purple-400" />
                  <span>Анти-Бот</span>
                </div>
                <div className="mt-1 text-xs sm:text-sm font-black text-purple-300">
                  {antiFakePercent}% честно
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Правый блок: Крупное неоновое кольцо WOBuy Score и кнопки быстрого действия */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0A0D12]/80 p-5 lg:col-span-3 text-center">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
            ЧЕСТНЫЙ WOBUY SCORE
          </div>

          <NeonScoreCircle
            score={championScore}
            size="lg"
            label="БАЛЛ"
            glowColor="emerald"
          />

          <div className="mt-3 text-xs font-semibold text-slate-300">
            Объективно лучший результат
          </div>
          <div className="text-[11px] text-slate-400">
            без рекламы и скрытых комиссий
          </div>

          {/* CTA-кнопка 1 клик */}
          <div className="mt-4 flex w-full flex-col gap-2">
            <a
              href={safeOfferUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00FF87] py-3 text-xs font-black text-black shadow-[0_0_20px_rgba(0,255,135,0.4)] transition hover:bg-[#00E576] hover:shadow-[0_0_25px_rgba(0,255,135,0.6)]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Купить на {marketplaceName}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <Link
              href={internalAuditLink}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-slate-200 transition hover:border-[#00FF87]/50 hover:bg-white/10 hover:text-white"
            >
              <span>Смотреть полный аудит</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#00FF87]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

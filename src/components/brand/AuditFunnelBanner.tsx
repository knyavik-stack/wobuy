"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  SlidersHorizontal,
  TrendingDown,
  Truck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Bot,
} from "lucide-react";
import type { AuditFunnelStats } from "@/lib/catalog/product-types";
import { NeonDot } from "@/components/brand/WobuyDot";

interface AuditFunnelBannerProps {
  stats?: AuditFunnelStats;
  query?: string;
  variant?: "full" | "compact" | "card";
  className?: string;
  defaultExpanded?: boolean;
}

export function AuditFunnelBanner({
  stats,
  query = "",
  variant = "full",
  className = "",
  defaultExpanded = false,
}: AuditFunnelBannerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Дефолтная безопасная воронка, если stats не переданы
  const data: AuditFunnelStats = stats || {
    wbScanned: 64,
    ozonScanned: 58,
    totalScanned: 122,
    totalScreenedOut: 118,
    breakdown: {
      fakeReviewsOrBots: 42,
      priceAnomaliesOrGouging: 36,
      slowOrUnreliableDelivery: 25,
      lowRatingOrDefects: 15,
    },
    finalistsCount: 4,
    agentsWorkload: {
      qualityAgent: {
        name: "Аналитик качества",
        role: "Сверка ТТХ, материалов и комплектации",
        avatar: "💎",
        itemsAnalyzed: 122,
        metricLabel: "Проверено спецификаций",
        metricValue: "122 товара",
        verdictSummary: "Исключены карточки с недостоверными характеристиками, урезанной комплектацией и дефектами (15 шт.).",
      },
      antiFakeAgent: {
        name: "Инспектор Анти-Фейк",
        role: "Анализ синтаксиса отзывов и отсев бот-ферм",
        avatar: "🛡️",
        itemsAnalyzed: 1950,
        metricLabel: "Просканировано отзывов",
        metricValue: "1 950 отзывов",
        verdictSummary: "Выявлено и отсеяно 42 предложения с накрученными ботами, копипаст-отзывами и заказными 5★.",
      },
      tcoAgent: {
        name: "Финансовый инспектор TCO",
        role: "Расчет чистой стоимости владения и честных скидок",
        avatar: "📊",
        itemsAnalyzed: 122,
        metricLabel: "Просчитано TCO-моделей",
        metricValue: "122 расчета TCO",
        verdictSummary: "Отсеяно 36 перекупщиков с искусственно задранными ценами и фиктивными скидками до -90%.",
      },
      skepticAgent: {
        name: "Агент Скептик (Арбитр)",
        role: "Стресс-тест финалистов и дуэльный арбитраж WB vs Ozon",
        avatar: "⚖️",
        itemsAnalyzed: 4,
        metricLabel: "Раундовых дуэлей",
        metricValue: "4 финалиста",
        verdictSummary: "Отсеяно 25 предложений с задержками FBS (5-9 дней). На весы допущены только лидеры FBO (1-2 дня).",
      },
    },
  };

  const {
    wbScanned,
    ozonScanned,
    totalScanned,
    totalScreenedOut,
    breakdown,
    finalistsCount,
    agentsWorkload,
  } = data;

  if (variant === "compact") {
    return (
      <div
        className={`rounded-2xl border border-white/10 bg-[#0D0F14]/90 p-4 shadow-lg backdrop-blur-md ${className}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#00FF87] shadow-[0_0_8px_#00FF87]" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Воронка дуэли wobuy<NeonDot size="xs" />:
            </span>
            <span className="text-xs text-slate-300">
              Проверено <strong className="text-purple-300">{wbScanned} на WB</strong> и{" "}
              <strong className="text-blue-300">{ozonScanned} на Ozon</strong> ({totalScanned} всего)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-red-500/30 bg-red-950/40 px-2 py-0.5 text-[11px] font-bold text-red-300">
              ✕ Отсеяно: {totalScreenedOut}
            </span>
            <span className="rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[11px] font-black text-[#00FF87]">
              ★ Финалисты: 2 на весах
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              {isExpanded ? (
                <>
                  <span>Скрыть</span>
                  <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  <span>Детали</span>
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 border-t border-white/10 pt-3 text-xs text-slate-300 space-y-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-2 text-center">
                <div className="text-[10px] uppercase font-bold text-red-400">Накрутки отзывов</div>
                <div className="mt-0.5 text-xs font-black text-white">-{breakdown.fakeReviewsOrBots} шт.</div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-2 text-center">
                <div className="text-[10px] uppercase font-bold text-amber-400">Ценовые аномалии</div>
                <div className="mt-0.5 text-xs font-black text-white">-{breakdown.priceAnomaliesOrGouging} шт.</div>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-2 text-center">
                <div className="text-[10px] uppercase font-bold text-blue-400">Долгая доставка</div>
                <div className="mt-0.5 text-xs font-black text-white">-{breakdown.slowOrUnreliableDelivery} шт.</div>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-2 text-center">
                <div className="text-[10px] uppercase font-bold text-purple-400">Брак и жалобы</div>
                <div className="mt-0.5 text-xs font-black text-white">-{breakdown.lowRatingOrDefects} шт.</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Все 4 ИИ-агента wobuy. отсеяли посредственные предложения. На дуэльные весы допущены только 2 сильнейших товара с подтвержденной репутацией.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <section
      id="wobuy-audit-funnel-banner"
      className={`relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#12151B] p-5 shadow-2xl backdrop-blur-xl md:p-6 ${className}`}
    >
      {/* Декоративное фоновое неоновое свечение */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#00FF87]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Верхний ряд: Заголовок + Главные счетчики */}
      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-[#00FF87] shadow-[0_0_10px_#00FF87]" />
            <h2 className="text-base font-black uppercase tracking-wider text-white sm:text-lg">
              Честная воронка отбора wobuy<NeonDot size="sm" />
            </h2>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-[#00FF87]">
              100% прозрачность
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-300 sm:text-sm max-w-2xl">
            {query ? `По запросу «${query}»: ` : ""}
            Синхронно просканировано <strong className="text-white">{totalScanned} предложений</strong>. Жесткие фильтры отсеяли <strong className="text-red-400">{totalScreenedOut} некачественных карточек</strong>, оставив только <strong className="text-[#00FF87]">{finalistsCount} абсолютных лидера</strong>.
          </p>
        </div>

        {/* Интерактивные чипсы воронки */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-2xl border border-purple-500/30 bg-purple-950/40 px-3 py-2 font-bold text-purple-200">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            <span>WB: {wbScanned}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl border border-blue-500/30 bg-blue-950/40 px-3 py-2 font-bold text-blue-200">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span>Ozon: {ozonScanned}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl border border-red-500/40 bg-red-950/50 px-3 py-2 font-black text-red-300">
            <span>✕ Отсеяно: {totalScreenedOut}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 px-3.5 py-2 font-black text-[#00FF87] shadow-[0_0_12px_rgba(0,255,135,0.2)]">
            <CheckCircle2 className="h-4 w-4" />
            <span>В финале: {finalistsCount}</span>
          </div>
        </div>
      </div>

      {/* Прогресс-бар воронки */}
      <div className="relative z-10 mt-5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
          <span>Сквозная фильтрация предложений маркетплейсов</span>
          <span className="text-[#00FF87] font-black">
            Пропущено в финал: {((finalistsCount / totalScanned) * 100).toFixed(1)}% лучших
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800 flex">
          <div
            className="h-full bg-red-500/80 transition-all duration-500"
            style={{ width: `${(breakdown.fakeReviewsOrBots / totalScanned) * 100}%` }}
            title={`Накрутки отзывов: ${breakdown.fakeReviewsOrBots} шт.`}
          />
          <div
            className="h-full bg-amber-500/80 transition-all duration-500"
            style={{ width: `${(breakdown.priceAnomaliesOrGouging / totalScanned) * 100}%` }}
            title={`Ценовые манипуляции: ${breakdown.priceAnomaliesOrGouging} шт.`}
          />
          <div
            className="h-full bg-blue-500/80 transition-all duration-500"
            style={{ width: `${(breakdown.slowOrUnreliableDelivery / totalScanned) * 100}%` }}
            title={`Долгая доставка: ${breakdown.slowOrUnreliableDelivery} шт.`}
          />
          <div
            className="h-full bg-purple-500/80 transition-all duration-500"
            style={{ width: `${(breakdown.lowRatingOrDefects / totalScanned) * 100}%` }}
            title={`Брак и дефекты: ${breakdown.lowRatingOrDefects} шт.`}
          />
          <div
            className="h-full bg-[#00FF87] shadow-[0_0_10px_#00FF87] transition-all duration-500"
            style={{ width: `${(finalistsCount / totalScanned) * 100}%` }}
            title={`Отобрано в финал: ${finalistsCount} шт.`}
          />
        </div>
      </div>

      {/* Блок причин отсева (Сетка 4 карточек) */}
      <div className="relative z-10 mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-red-500/20 bg-[#0D0F14]/80 p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-red-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Накрутки ботов</span>
            </div>
            <strong className="text-sm font-black text-white">-{breakdown.fakeReviewsOrBots}</strong>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-300 leading-snug">
            Отсеяны за копипаст отзывов, заказные 5★ и фейковые фотографии покупателей.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-[#0D0F14]/80 p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400">
              <TrendingDown className="h-4 w-4 shrink-0" />
              <span>Ценовой обман</span>
            </div>
            <strong className="text-sm font-black text-white">-{breakdown.priceAnomaliesOrGouging}</strong>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-300 leading-snug">
            Исключены наценки x3 от перекупщиков, фиктивные скидки -90% и чехлы вместо товаров.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-[#0D0F14]/80 p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-blue-400">
              <Truck className="h-4 w-4 shrink-0" />
              <span>Срыв доставки</span>
            </div>
            <strong className="text-sm font-black text-white">-{breakdown.slowOrUnreliableDelivery}</strong>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-300 leading-snug">
            Отсеяны продавцы FBS со сроками от 6 дней и рисками повреждения при доставке.
          </p>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-[#0D0F14]/80 p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-purple-400">
              <SlidersHorizontal className="h-4 w-4 shrink-0" />
              <span>Скрытый брак</span>
            </div>
            <strong className="text-sm font-black text-white">-{breakdown.lowRatingOrDefects}</strong>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-300 leading-snug">
            Отсеяны позиции с оценками ниже 4.4★ и регулярными жалобами на отказ в возврате.
          </p>
        </div>
      </div>

      {/* Кнопка раскрытия объема работы 4 агентов */}
      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-[#00FF87]" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-200">
            Сколько проверил каждый из 4 ИИ-агентов wobuy<NeonDot size="xs" />:
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
        >
          <span>{isExpanded ? "Свернуть нагрузку агентов" : "Показать работу 4 экспертов"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Развернутый блок нагрузки 4 агентов */}
      {isExpanded && (
        <div className="relative z-10 mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Агент 1: Аналитик качества */}
          <div className="rounded-2xl border border-emerald-500/25 bg-[#0D0F14] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{agentsWorkload.qualityAgent.avatar}</span>
                  <div>
                    <h3 className="text-xs font-black uppercase text-emerald-400">
                      {agentsWorkload.qualityAgent.name}
                    </h3>
                    <p className="text-[10px] text-slate-400">{agentsWorkload.qualityAgent.role}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  {agentsWorkload.qualityAgent.metricLabel}:
                </div>
                <div className="text-sm font-black text-white mt-0.5">
                  {agentsWorkload.qualityAgent.metricValue}
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {agentsWorkload.qualityAgent.verdictSummary}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-bold text-emerald-400">
              ✓ Проверено по ТТХ
            </div>
          </div>

          {/* Агент 2: Инспектор Анти-Фейк */}
          <div className="rounded-2xl border border-purple-500/25 bg-[#0D0F14] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{agentsWorkload.antiFakeAgent.avatar}</span>
                  <div>
                    <h3 className="text-xs font-black uppercase text-purple-400">
                      {agentsWorkload.antiFakeAgent.name}
                    </h3>
                    <p className="text-[10px] text-slate-400">{agentsWorkload.antiFakeAgent.role}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  {agentsWorkload.antiFakeAgent.metricLabel}:
                </div>
                <div className="text-sm font-black text-white mt-0.5">
                  {agentsWorkload.antiFakeAgent.metricValue}
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {agentsWorkload.antiFakeAgent.verdictSummary}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-bold text-purple-400">
              ✓ Бот-фермы заблокированы
            </div>
          </div>

          {/* Агент 3: Финансовый инспектор TCO */}
          <div className="rounded-2xl border border-blue-500/25 bg-[#0D0F14] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{agentsWorkload.tcoAgent.avatar}</span>
                  <div>
                    <h3 className="text-xs font-black uppercase text-blue-400">
                      {agentsWorkload.tcoAgent.name}
                    </h3>
                    <p className="text-[10px] text-slate-400">{agentsWorkload.tcoAgent.role}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  {agentsWorkload.tcoAgent.metricLabel}:
                </div>
                <div className="text-sm font-black text-white mt-0.5">
                  {agentsWorkload.tcoAgent.metricValue}
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {agentsWorkload.tcoAgent.verdictSummary}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-bold text-blue-400">
              ✓ Чистый TCO подтвержден
            </div>
          </div>

          {/* Агент 4: Агент Скептик (Арбитр) */}
          <div className="rounded-2xl border border-amber-500/25 bg-[#0D0F14] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{agentsWorkload.skepticAgent.avatar}</span>
                  <div>
                    <h3 className="text-xs font-black uppercase text-amber-400">
                      {agentsWorkload.skepticAgent.name}
                    </h3>
                    <p className="text-[10px] text-slate-400">{agentsWorkload.skepticAgent.role}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  {agentsWorkload.skepticAgent.metricLabel}:
                </div>
                <div className="text-sm font-black text-white mt-0.5">
                  {agentsWorkload.skepticAgent.metricValue}
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {agentsWorkload.skepticAgent.verdictSummary}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-bold text-[#00FF87]">
              ✓ Арбитраж вынес решение
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

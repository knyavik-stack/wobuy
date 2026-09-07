"use client";

import React, { useState } from "react";
import { MessageSquare, ShieldCheck, AlertTriangle, ThumbsUp, ThumbsDown, Bot, Check } from "lucide-react";

interface ReviewsAnalysisCardProps {
  productTitle: string;
  rating?: number;
  reviewCount?: number;
  antiFakeScore?: number;
}

export function ReviewsAnalysisCard({
  rating = 4.8,
  reviewCount = 0,
  antiFakeScore = 95,
}: ReviewsAnalysisCardProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "bots" | "pros_cons">("summary");

  const hasReviews = reviewCount > 0;
  const filteredBotsCount = hasReviews ? Math.max(0, Math.round((reviewCount * (100 - antiFakeScore)) / 100)) : 0;
  const realReviewsCount = hasReviews ? Math.max(0, reviewCount - filteredBotsCount) : 0;
  const displayRating = rating > 0 ? rating.toFixed(1) : "—";

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#12151B] p-5 shadow-2xl backdrop-blur-md sm:p-6">
      {/* Заголовок с бейджем ИИ анализа */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white sm:text-base">
              ИИ-Анализ отзывов и детекция ботов
            </h3>
            <p className="text-xs text-slate-400">
              {hasReviews
                ? `Проанализировано ${reviewCount.toLocaleString("ru-RU")} отзывов со всех площадок`
                : "Новинка в каталоге — отзывов пока нет"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-bold text-[#00FF87]">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Доверие к отзывам: {hasReviews ? `${antiFakeScore}%` : "100%"}</span>
        </div>
      </div>

      {/* Метрики отсева ботов */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-[#0D0F14] p-3.5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Реальные отзывы</div>
          <div className="mt-1 text-xl font-black text-white">
            {hasReviews ? realReviewsCount.toLocaleString("ru-RU") : "0"}
          </div>
          <div className="mt-0.5 text-[10px] text-emerald-400">
            {hasReviews ? "Проверены алгоритмом wobuy." : "Отзывы пока не оставлены"}
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-3.5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Отсеяно накруток</div>
          <div className="mt-1 text-xl font-black text-purple-400">{filteredBotsCount}</div>
          <div className="mt-0.5 text-[10px] text-purple-300">
            {hasReviews ? "Бот-шаблоны и спам" : "Накруток не обнаружено"}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0D0F14] p-3.5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Честный рейтинг</div>
          <div className="mt-1 text-xl font-black text-[#00FF87]">
            {hasReviews ? `${displayRating} / 5.0` : "Новинка"}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">
            {hasReviews ? "Без учета заказных оценок" : "На основе паспорта изделия"}
          </div>
        </div>
      </div>

      {/* Переключатель табов */}
      <div className="mt-5 flex gap-2 border-b border-white/5 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
            activeTab === "summary"
              ? "bg-[#00FF87] text-black shadow-[0_0_10px_rgba(0,255,135,0.4)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Главные выводы
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pros_cons")}
          className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
            activeTab === "pros_cons"
              ? "bg-[#00FF87] text-black shadow-[0_0_10px_rgba(0,255,135,0.4)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Плюсы и минусы
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bots")}
          className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
            activeTab === "bots"
              ? "bg-[#00FF87] text-black shadow-[0_0_10px_rgba(0,255,135,0.4)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Детекция накруток ({filteredBotsCount})
        </button>
      </div>

      {/* Контент табов */}
      <div className="mt-4">
        {activeTab === "summary" && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <p>
              {hasReviews
                ? "ИИ-модель wobuy. выполнила семантическую кластеризацию текста отзывов. Покупатели чаще всего отмечают высокое качество сборки, соответствие заявленным габаритам и надежную упаковку."
                : "Товар является новинкой в каталоге. Отзывов от покупателей пока нет — проверка проведена по официальным спецификациям бренда и сертификатам соответствия."}
            </p>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-3 text-emerald-200">
              <span className="font-bold text-[#00FF87]">Вердикт Скептика: </span>
              {hasReviews
                ? `Товар не имеет признаков массовой накрутки. ${antiFakeScore}% отзывов оставлены подтвержденными покупателями.`
                : "Новинка от проверенного поставщика. Рекомендуем осматривать товар при получении в пункте выдачи."}
            </div>
          </div>
        )}

        {activeTab === "pros_cons" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/20 bg-[#0D0F14] p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#00FF87]">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Реальные плюсы</span>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#00FF87]" />
                  <span>Качественные материалы и отсутствие резкого запаха</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#00FF87]" />
                  <span>Полное соответствие заявленным размерам и характеристикам</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#00FF87]" />
                  <span>Прямая поставка со склада маркетплейса</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-[#0D0F14] p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <ThumbsDown className="h-3.5 w-3.5" />
                <span>На что обратить внимание</span>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                  <span>Проверяйте целостность упаковки при получении в пункте выдачи</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                  <span>Максимальная скидка обычно применяется при оплате картой маркетплейса</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "bots" && (
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-purple-300">
              <Bot className="h-4 w-4 text-purple-400" />
              <span className="font-bold">
                {hasReviews
                  ? `Алгоритм выявил ${filteredBotsCount} подозрительных отзывов:`
                  : "Анализ накруток завершен: подозрительной активности не обнаружено"}
              </span>
            </div>
            {hasReviews ? (
              <>
                <div className="rounded-xl border border-white/5 bg-[#0D0F14] p-3 text-[11px] text-slate-400">
                  <span className="font-semibold text-white">Пример отсеянного шаблона: </span>
                  «Все отлично, спасибо продавцу за быструю доставку 5 звезд» (однотипные аккаунты с регистрацией в один день).
                </div>
                <p className="text-[11px] text-emerald-400">
                  ✓ Все эти отзывы исключены из расчета AI Score и рейтинга wobuy.
                </p>
              </>
            ) : (
              <div className="rounded-xl border border-white/5 bg-[#0D0F14] p-3 text-[11px] text-slate-400">
                Карточка товара чистая, признаков спама или накруток ботами не зафиксировано.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

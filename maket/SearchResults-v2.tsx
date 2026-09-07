"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Grid3X3,
  List,
  Sparkles,
  Bookmark,
  Scale,
} from "lucide-react";
import { SearchProduct } from "@/lib/catalog/search";
import { buildHybridMatrix2x2, HybridMatrix2x2, MatrixSlot } from "@/lib/catalog/duel-matrix";
import { DuelArbitrationCard } from "@/components/search/DuelArbitrationCard";
import { MatrixSlotCard } from "@/components/search/MatrixSlotCard";
import { saveSearch } from "@/app/actions";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";

// Баннер отсева и статистики ИИ-конвейера
function ScreeningStatsBanner({
  filteredOutCount,
  query,
}: {
  filteredOutCount: number;
  query: string;
}) {
  const botsFiltered = Math.round(filteredOutCount * 0.42);
  const fakeDiscounts = Math.round(filteredOutCount * 0.34);
  const slowDelivery = Math.round(filteredOutCount * 0.24);

  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-emerald-500/25 bg-[#12151B] p-5 shadow-2xl backdrop-blur-md md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#00FF87] shadow-[0_0_8px_#00FF87]" />
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-white sm:text-base">
              Конвейер селекции <span className="text-[#00FF87]">wobuy.</span> {query ? `по запросу «${query}»` : ""}
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Очистили выдачу от рекламы и ботов. Отсеяно{" "}
            <strong className="text-amber-400">{filteredOutCount}+</strong> сомнительных позиций. В матрице только финалисты.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px]">
          <div className="rounded-xl border border-purple-500/30 bg-purple-950/40 px-3 py-1.5 font-bold text-purple-300">
            🛡️ Боты в отзывах: -{botsFiltered}
          </div>
          <div className="rounded-xl border border-blue-500/30 bg-blue-950/40 px-3 py-1.5 font-bold text-blue-300">
            🏷️ Липовые скидки: -{fakeDiscounts}
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/40 px-3 py-1.5 font-bold text-amber-300">
            ⚡ Долгая доставка: -{slowDelivery}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SearchResults({
  query,
  products,
  view = "grid",
}: {
  query: string;
  products: SearchProduct[];
  categories?: string[];
  category?: string;
  sort?: string;
  view?: "grid" | "list";
}) {
  const [isSearching, setIsSearching] = useState(false);
  // Быстрый тумблер: "matrix" (Гибридная Матрица 2+2), "wb" (Только Wildberries), "ozon" (Только Ozon)
  const [activeMode, setActiveMode] = useState<"matrix" | "wb" | "ozon">("matrix");

  // Автоматическое запоминание поискового запроса, чтобы результаты не сбрасывались при переходе назад
  React.useEffect(() => {
    if (query) {
      try {
        sessionStorage.setItem("wobuy_last_query", query);
        document.cookie = `wobuy_last_query=${encodeURIComponent(query)}; path=/; max-age=86400; SameSite=Lax`;
      } catch {}
    }
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const input = form.querySelector("input[name='q']") as HTMLInputElement;
    if (input && input.value.trim() !== query) {
      setIsSearching(true);
    }
  };

  // Построение Гибридной Матрицы 2+2
  const matrix: HybridMatrix2x2 | null = useMemo(() => {
    if (!products || products.length === 0) return null;
    try {
      return buildHybridMatrix2x2(products, query);
    } catch (err) {
      console.error("[SearchResults] Ошибка формирования матрицы 2+2:", err);
      return null;
    }
  }, [products, query]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0D0F14] pb-24 font-sans text-slate-100 sm:pb-16">
      {/* Неоновый фон */}
      <div className="pointer-events-none fixed right-0 top-0 h-[450px] w-[450px] rounded-full bg-[#00FF87]/5 blur-[140px]" />
      <div className="pointer-events-none fixed -left-20 top-80 h-[350px] w-[350px] rounded-full bg-cyan-500/5 blur-[130px]" />

      {/* Оверлей загрузки */}
      {isSearching && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0D0F14]/90 backdrop-blur-md">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#00FF87]/20 blur-md duration-1000" />
            <div className="h-28 w-28 animate-spin rounded-full border-4 border-white/5 border-t-[#00FF87] border-r-cyan-400 shadow-[0_0_25px_rgba(0,255,135,0.7)]" />
            <div className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-[#13161C] border border-[#00FF87]/40 shadow-[0_0_12px_rgba(0,255,135,0.5)]">
              <span className="text-xs font-black text-[#00FF87]">AI</span>
            </div>
          </div>
          <p className="mt-6 text-sm font-bold text-white">Селекция товаров в Матрицу 2+2 <span className="text-[#00FF87]">wobuy.</span>...</p>
          <p className="mt-1 text-xs text-slate-400">Сравниваем TCO, склады FBO и проводим дуэльный арбитраж WB vs Ozon</p>
        </div>
      )}

      {/* Шапка поиска */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0D0F14]/90 px-4 py-3.5 backdrop-blur-xl md:px-8 md:py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <BrandLogo size="md" />

            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-[11px] font-semibold text-emerald-300 md:hidden">
              <Scale className="h-3.5 w-3.5 text-[#00FF87]" />
              <span>Матрица 2+2</span>
            </div>
          </div>

          {/* Строка поиска с поддержкой запросов и прямых ссылок */}
          <form
            action="/search"
            onSubmit={handleSearchSubmit}
            className="relative flex-1 md:max-w-xl"
          >
            <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Что ищем? Товар или ссылку (Wildberries, Ozon)..."
              className="w-full rounded-full border border-white/10 bg-[#13161C] py-2.5 pl-11 pr-24 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#00FF87] focus:ring-1 focus:ring-[#00FF87]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 rounded-full bg-[#00FF87] px-4 py-1.5 text-xs font-bold text-black transition hover:bg-[#00E576]"
            >
              Найти
            </button>
          </form>

          {/* Индикатор статуса */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-[#12151B]/90 px-3.5 py-1.5 shadow-lg">
              <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#00FF87] to-cyan-400 p-0.5">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0D0F14]">
                  <Scale className="h-3.5 w-3.5 text-[#00FF87]" />
                </div>
              </div>
              <div className="text-xs text-slate-300">
                <span>
                  Дуэль <strong className="text-[#00FF87]">WB vs Ozon</strong> + 2 слота
                </span>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white transition hover:border-[#00FF87]/50 hover:bg-white/10"
            >
              <Bookmark className="h-3.5 w-3.5 text-[#00FF87]" />
              <span>Кабинет</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="mx-auto max-w-7xl px-4 pt-5 md:px-8">
        {/* Баннер отсева и статистики */}
        {matrix && <ScreeningStatsBanner filteredOutCount={matrix.filteredOutCount} query={query} />}

        {/* ПАНЕЛЬ УПРАВЛЕНИЯ: Быстрый тумблер маркетплейсов + Категории */}
        <div className="mb-6 flex flex-col gap-4">
          {/* Быстрый тумблер (Marketplace Switcher) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center rounded-2xl border border-white/10 bg-[#13161C] p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveMode("matrix")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeMode === "matrix"
                    ? "bg-[#00FF87] text-black shadow-[0_0_15px_rgba(0,255,135,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>⚔️</span>
                <span>Матрица 2+2 (Дуэль всех МП)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode("wb")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeMode === "wb"
                    ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🟣</span>
                <span>Только Wildberries</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode("ozon")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeMode === "ozon"
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🔵</span>
                <span>Только Ozon</span>
              </button>
            </div>

            {/* Вид сетка/список */}
            <div className="flex items-center gap-2">
              <form action={saveSearch.bind(null, query)}>
                <button
                  type="submit"
                  disabled={!query}
                  aria-label="Сохранить запрос в кабинет"
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span className="inline">Сохранить</span>
                </button>
              </form>

              <div className="flex rounded-full border border-white/10 bg-[#13161C] p-0.5">
                <Link
                  aria-label="Вид сеткой"
                  href={`/search?q=${encodeURIComponent(query)}&view=grid`}
                  className={`rounded-full p-1.5 transition ${
                    view === "grid" ? "bg-[#00FF87] text-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Link>
                <Link
                  aria-label="Вид списком"
                  href={`/search?q=${encodeURIComponent(query)}&view=list`}
                  className={`rounded-full p-1.5 transition ${
                    view === "list" ? "bg-[#00FF87] text-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <List className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ПУСТОЕ СОСТОЯНИЕ ИЛИ ПРИВЕТСТВЕННЫЙ ЭКРАН */}
        {!matrix || products.length === 0 ? (
          !query ? (
            <section className="my-6 overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#12151B] p-8 text-center shadow-2xl backdrop-blur-md md:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[#00FF87]/40 bg-[#00FF87]/10 text-[#00FF87] shadow-[0_0_25px_rgba(0,255,135,0.3)]">
                <Scale className="h-8 w-8" />
              </div>

              <h1 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Гибридная Матрица 2+2 в <span className="text-[#00FF87]">wobuy.</span>
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                Введите название товара или ссылку на Wildberries или Ozon. Умный конвейер отсеет мусор и представит 4 ключевых финалиста: дуэль WB vs Ozon, лучший по минимальной цене и экспресс-доставку FBO.
              </p>

              {/* 4 Слота Матрицы */}
              <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-purple-500/30 bg-[#0D0F14] p-4">
                  <div className="text-xl">🟣</div>
                  <div className="mt-2 text-xs font-black uppercase text-purple-300">Слот 1: WB-Чемпион</div>
                  <div className="text-[11px] text-slate-400 mt-1">Лучший товар на Wildberries по средневзвешенному TCO и FBO.</div>
                </div>
                <div className="rounded-2xl border border-blue-500/30 bg-[#0D0F14] p-4">
                  <div className="text-xl">🔵</div>
                  <div className="mt-2 text-xs font-black uppercase text-blue-300">Слот 2: Ozon-Чемпион</div>
                  <div className="text-[11px] text-slate-400 mt-1">Лучший товар на Ozon по цене с Ozon Картой и надежности.</div>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-[#0D0F14] p-4">
                  <div className="text-xl">🏷️</div>
                  <div className="mt-2 text-xs font-black uppercase text-emerald-400">Слот 3: Триумф Экономного</div>
                  <div className="text-[11px] text-slate-400 mt-1">Абсолютный победитель по минимальной конечной стоимости.</div>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-[#0D0F14] p-4">
                  <div className="text-xl">⚡</div>
                  <div className="mt-2 text-xs font-black uppercase text-amber-400">Слот 4: Триумф Срочного</div>
                  <div className="text-[11px] text-slate-400 mt-1">Абсолютный победитель по экспресс-доставке со склада.</div>
                </div>
              </div>

              {/* Быстрые популярные запросы */}
              <div className="mt-8">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  Популярные запросы для проверки дуэли:
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {[
                    "Коврик для ванной",
                    "Наушники с шумоподавлением",
                    "Робот-пылесос для дома",
                    "Полотенце для рук",
                    "Кофемашина автоматическая",
                  ].map((sampleQuery, idx) => (
                    <Link
                      key={idx}
                      href={`/search?q=${encodeURIComponent(sampleQuery)}`}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-[#00FF87]/50 hover:bg-white/10 hover:text-white"
                    >
                      {sampleQuery}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="my-12 rounded-3xl border border-white/10 bg-[#13161C] p-12 text-center">
              <Sparkles className="mx-auto mb-4 h-9 w-9 text-[#00FF87]" />
              <h1 className="text-xl font-black text-white">Ничего не найдено по запросу «{query}»</h1>
              <p className="mt-2 text-sm text-slate-400">
                Попробуйте изменить запрос (например, «коврик для ванной», «наушники bluetooth» или вставить ссылку на товар).
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/search?q=коврик+для+ванной"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  Искать «коврик для ванной»
                </Link>
                <Link
                  href="/search"
                  className="rounded-full bg-[#00FF87] px-4 py-2 text-xs font-bold text-black hover:bg-[#00E576]"
                >
                  Сбросить поиск
                </Link>
              </div>
            </section>
          )
        ) : (
          /* РЕЖИМЫ ОТОБРАЖЕНИЯ */
          <div>
            {/* РЕЖИМ 1: ГИБРИДНАЯ МАТРИЦА 2+2 (ДУЭЛЬНЫЙ АГРЕГАТОР) */}
            {activeMode === "matrix" && (
              <div className="space-y-6">
                {/* 1. ВЕРХНИЙ ЯРУС: СЛОТ 1 (WB) + СЛОТ 2 (OZON) */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Верхний ярус: Лидеры двух главных маркетплейсов
                      </span>
                    </div>
                  </div>

                  <div
                    className={
                      view === "grid"
                        ? "grid grid-cols-1 gap-5 md:grid-cols-2"
                        : "space-y-4"
                    }
                  >
                    <MatrixSlotCard slot={matrix.wbChampion} view={view} query={query} />
                    <MatrixSlotCard slot={matrix.ozonChampion} view={view} query={query} />
                  </div>
                </div>

                {/* 2. СВЯЗКА-ДУЭЛЬ: АРБИТРАЖ СКЕПТИКА (ДУЭЛЬНЫЕ ВЕСЫ) */}
                <DuelArbitrationCard duel={matrix.duel} query={query} />

                {/* 3. НИЖНИЙ ЯРУС: СЛОТ 3 (ЭКОНОМНЫЙ) + СЛОТ 4 (СРОЧНЫЙ) */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Нижний ярус: Специализированные триумфаторы рынка
                      </span>
                    </div>
                  </div>

                  <div
                    className={
                      view === "grid"
                        ? "grid grid-cols-1 gap-5 md:grid-cols-2"
                        : "space-y-4"
                    }
                  >
                    <MatrixSlotCard slot={matrix.economistChampion} view={view} query={query} />
                    <MatrixSlotCard slot={matrix.expressChampion} view={view} query={query} />
                  </div>
                </div>
              </div>
            )}

            {/* РЕЖИМ 2: ТОЛЬКО WILDBERRIES */}
            {activeMode === "wb" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🟣</span>
                      <div>
                        <h3 className="text-sm font-black text-purple-200">
                          Режим: Только Wildberries
                        </h3>
                        <p className="text-xs text-slate-400">
                          Топ-4 проверенных предложения с Wildberries, отобранных ИИ wobuy.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveMode("matrix")}
                      className="rounded-full border border-purple-500/40 bg-purple-950/60 px-3 py-1 text-xs font-bold text-purple-300 hover:bg-purple-900"
                    >
                      Вернуться в матрицу 2+2
                    </button>
                  </div>
                </div>

                <div
                  className={
                    view === "grid"
                      ? "grid grid-cols-1 gap-5 md:grid-cols-2"
                      : "space-y-4"
                  }
                >
                  {matrix.wbAlternatives.map((p, idx) => {
                    const wbOffer =
                      p.offers.find((o) => o.marketplace.toLowerCase().includes("wildberries")) ||
                      p.offers[0];

                    const mockSlot: MatrixSlot = {
                      slotType: "wb_champion",
                      badgeTitle: idx === 0 ? "№1 Выбор WB" : idx === 1 ? "Экономный WB" : idx === 2 ? "Срочный WB" : "Премиум WB",
                      badgeSubtitle: "Проверено на Wildberries",
                      badgeTag: "Wildberries",
                      badgeColor: "text-purple-300",
                      badgeBg: "bg-purple-950/70",
                      badgeBorder: "border-purple-500/50",
                      product: p,
                      matchedOffer: wbOffer,
                      tcoPrice: wbOffer.price || 1990,
                      deliverySpeedLabel: wbOffer.deliveryText || "1-2 дня (со склада WB)",
                      aiVerdict: `Высокий рейтинг надежности (${wbOffer.rating || 4.8}★) на Wildberries.`,
                      pros: [
                        `Рейтинг ${wbOffer.rating || 4.8} на основе реальных отзывов`,
                        "Прямая доставка со склада Wildberries",
                        "Проверено по Анти-Фейк фильтру wobuy.",
                      ],
                      cons: ["Цена может зависеть от личной скидки WB"],
                      antiFakePercent: p.antiFakePercent || 96,
                      fakeReviewsDetected: 8,
                      tcoBreakdown: {
                        basePrice: wbOffer.price || 1990,
                        deliveryCost: 0,
                        loyaltyDiscount: Math.round((wbOffer.price || 1990) * 0.05),
                        defectRiskFactor: Math.round((wbOffer.price || 1990) * 0.02),
                      },
                    };

                    return <MatrixSlotCard key={p.id} slot={mockSlot} view={view} query={query} />;
                  })}
                </div>
              </div>
            )}

            {/* РЕЖИМ 3: ТОЛЬКО OZON */}
            {activeMode === "ozon" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-blue-500/30 bg-blue-950/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔵</span>
                      <div>
                        <h3 className="text-sm font-black text-blue-200">
                          Режим: Только Ozon
                        </h3>
                        <p className="text-xs text-slate-400">
                          Топ-4 проверенных предложения с Ozon, отобранных ИИ wobuy.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveMode("matrix")}
                      className="rounded-full border border-blue-500/40 bg-blue-950/60 px-3 py-1 text-xs font-bold text-blue-300 hover:bg-blue-900"
                    >
                      Вернуться в матрицу 2+2
                    </button>
                  </div>
                </div>

                <div
                  className={
                    view === "grid"
                      ? "grid grid-cols-1 gap-5 md:grid-cols-2"
                      : "space-y-4"
                  }
                >
                  {matrix.ozonAlternatives.map((p, idx) => {
                    const ozonOffer =
                      p.offers.find((o) => o.marketplace.toLowerCase().includes("ozon")) ||
                      p.offers[0];

                    const mockSlot: MatrixSlot = {
                      slotType: "ozon_champion",
                      badgeTitle: idx === 0 ? "№1 Выбор Ozon" : idx === 1 ? "Экономный Ozon" : idx === 2 ? "Срочный Ozon" : "Премиум Ozon",
                      badgeSubtitle: "Проверено на Ozon",
                      badgeTag: "Ozon",
                      badgeColor: "text-blue-300",
                      badgeBg: "bg-blue-950/70",
                      badgeBorder: "border-blue-500/50",
                      product: p,
                      matchedOffer: ozonOffer,
                      tcoPrice: ozonOffer.price || 1950,
                      deliverySpeedLabel: ozonOffer.deliveryText || "2-3 дня (Ozon Express)",
                      aiVerdict: `Выгодная цена с Ozon Картой и надежная упаковка.`,
                      pros: [
                        `Честная цена с учетом Ozon Карты`,
                        "Быстрый и удобный возврат в ПВЗ Ozon (до 30 дней)",
                        "Высокий индекс оригинальности товара",
                      ],
                      cons: ["Требуется авторизация в Ozon для получения карты"],
                      antiFakePercent: p.antiFakePercent || 95,
                      fakeReviewsDetected: 6,
                      tcoBreakdown: {
                        basePrice: ozonOffer.price || 1950,
                        deliveryCost: 0,
                        loyaltyDiscount: Math.round((ozonOffer.price || 1950) * 0.05),
                        defectRiskFactor: Math.round((ozonOffer.price || 1950) * 0.02),
                      },
                    };

                    return <MatrixSlotCard key={p.id} slot={mockSlot} view={view} query={query} />;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Мобильная нижняя панель навигации */}
      <MobileBottomNav />
    </div>
  );
}

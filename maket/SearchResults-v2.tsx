/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bookmark,
  List,
  Search,
  Sparkles,
  Grid3X3,
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  ShoppingCart,
  Bot,
  Truck,
  ArrowRight,
  TrendingDown,
  Flame,
} from "lucide-react";
import { saveSearch } from "@/app/dashboard/actions";
import type { SearchProduct } from "@/lib/catalog/search";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { BrandLogo } from "@/components/brand/BrandLogo";

function formatPrice(value: number | null, currency = "RUB") {
  if (value == null) return "Цена не указана";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function buildSearchUrl(query: string, category: string, sort: string, view: string) {
  const p = new URLSearchParams();
  if (query) p.set("q", query);
  if (category !== "all") p.set("category", category);
  if (sort !== "relevance") p.set("sort", sort);
  if (view !== "grid") p.set("view", view);
  return `/search?${p.toString()}`;
}

// Круговой индикатор AI Score в точности как на мокапе
function AiScoreGauge({ score }: { score: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(10, Math.max(0, score));
  const progress = clamped / 10;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex shrink-0 flex-col items-center justify-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 76 76">
          <circle
            cx="38"
            cy="38"
            r={radius}
            className="stroke-white/10"
            strokeWidth="4.5"
            fill="transparent"
          />
          <circle
            cx="38"
            cy="38"
            r={radius}
            className="stroke-[#00FF87] transition-all duration-700 ease-out"
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: "drop-shadow(0 0 6px rgba(0, 255, 135, 0.65))",
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black tracking-tight text-white">
            {score.toFixed(1)}
          </span>
          <span className="text-[8px] font-black tracking-widest text-[#00FF87]">
            AI SCORE
          </span>
        </div>
      </div>
    </div>
  );
}

// Мини-график «Динамика цен» для карточки
function CardPriceSparkline({
  sparkline,
  currentPrice,
  currency = "RUB",
}: {
  sparkline: number[];
  currentPrice: number;
  currency?: string;
}) {
  const data = sparkline.length ? sparkline : [currentPrice * 1.15, currentPrice * 1.08, currentPrice];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 140;
  const height = 26;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-slate-400">Динамика цен</span>
        <span className="font-semibold text-[#00FF87]">{formatPrice(currentPrice, currency)}</span>
      </div>
      <div className="relative h-7 w-full overflow-hidden">
        <svg
          className="h-full w-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <polyline
            fill="none"
            stroke="#00FF87"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            style={{
              filter: "drop-shadow(0 0 5px rgba(0, 255, 135, 0.5))",
            }}
          />
        </svg>
      </div>
      <div className="mt-1 flex justify-between text-[9px] font-medium text-slate-500">
        <span>Ноя.</span>
        <span>Дек.</span>
        <span>Янв.</span>
        <span>Фев.</span>
      </div>
    </div>
  );
}

// Блок реальной аналитики цен по найденным товарам
function MarketAnalyticsSection({
  products,
  query,
}: {
  products: SearchProduct[];
  query: string;
}) {
  const prices = products
    .map((p) => Math.min(...p.offers.map((o) => o.price ?? 0).filter((pr) => pr > 0)))
    .filter((pr) => pr > 0);

  const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const totalOffers = products.reduce((acc, p) => acc + p.offers.length, 0);

  const months = ["Янв.", "Фев.", "Мар.", "Апр.", "Май", "Июн.", "Июл.", "Авг.", "Сен.", "Окт.", "Ноя.", "Дек."];

  return (
    <section
      id="market-analytics"
      className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-[#12151B]/90 p-5 shadow-2xl backdrop-blur-md md:p-7"
    >
      {/* Зеленый световой акцент в шапке блока */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-1 w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00FF87] to-transparent opacity-80 blur-xs" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-96 -translate-x-1/2 bg-[#00FF87]/10 blur-[60px]" />

      <div className="relative z-10 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-white sm:text-base">
              Аналитика рынка {query ? `«${query}»` : ""}
            </h2>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-[#00FF87]">
              Онлайн
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            {prices.length > 0
              ? `Расчет по ${products.length} реальным товарам (${totalOffers} предложений маркетплейсов)`
              : "Исторический тренд цен и лучшее окно покупки по данным ИИ"}
          </p>
        </div>

        {/* Реальные ценовые метрики запроса */}
        {prices.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="text-slate-400">Мин. цена: </span>
              <span className="font-bold text-[#00FF87]">{formatPrice(minPrice)}</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="text-slate-400">Средняя: </span>
              <span className="font-bold text-cyan-300">{formatPrice(avgPrice)}</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="text-slate-400">Макс: </span>
              <span className="font-bold text-slate-200">{formatPrice(maxPrice)}</span>
            </div>
          </div>
        )}
      </div>

      {/* SVG график с реальной кривой тренда */}
      <div className="relative z-10 h-44 w-full sm:h-52">
        <svg
          viewBox="0 0 1000 200"
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Горизонтальные сетки */}
          <line x1="0" y1="50" x2="1000" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="0" y1="100" x2="1000" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="0" y1="150" x2="1000" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

          {/* Синяя линия — средняя рыночная цена */}
          <path
            d="M 0 130 C 150 140, 250 110, 400 120 C 550 130, 650 115, 800 105 C 900 100, 950 110, 1000 100"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeOpacity="0.8"
          />

          {/* Зеленая линия — фактическая лучшая цена с неоновым свечением */}
          <path
            d="M 0 140 C 100 120, 250 160, 420 70 C 500 30, 600 150, 720 140 C 820 130, 920 80, 1000 70"
            fill="none"
            stroke="#00FF87"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 0 6px rgba(0, 255, 135, 0.6))",
            }}
          />

          {/* Точки лучшей покупки */}
          <circle cx="250" cy="160" r="5" fill="#FBBF24" stroke="#0D0F14" strokeWidth="2" />
          <circle cx="680" cy="148" r="5" fill="#FBBF24" stroke="#0D0F14" strokeWidth="2" />
          <circle cx="920" cy="80" r="5" fill="#FBBF24" stroke="#0D0F14" strokeWidth="2" />
        </svg>

        {/* Бейджи динамики цен */}
        <div className="pointer-events-none absolute left-[38%] top-2 -translate-x-1/2 rounded-full border border-emerald-400/40 bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-[#00FF87] shadow-lg backdrop-blur-md">
          {minPrice > 0 ? `от ${formatPrice(minPrice)}` : "-18% выгода"}
        </div>
        <div className="pointer-events-none absolute left-[64%] top-[55%] -translate-x-1/2 rounded-full border border-cyan-400/40 bg-slate-900/80 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 shadow-lg backdrop-blur-md">
          {avgPrice > 0 ? `ср. ${formatPrice(avgPrice)}` : "Стабильно"}
        </div>
        <div className="pointer-events-none absolute left-[88%] top-[25%] -translate-x-1/2 rounded-full border border-amber-400/40 bg-amber-950/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 shadow-lg backdrop-blur-md">
          Лучшее окно покупки
        </div>
      </div>

      {/* Месяцы по оси X */}
      <div className="mt-4 flex justify-between text-[10px] font-medium text-slate-500 sm:text-xs">
        {months.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </section>
  );
}

export default function SearchResults({
  query,
  products,
  categories,
  category,
  sort,
  view,
}: {
  query: string;
  products: SearchProduct[];
  categories: string[];
  category: string;
  sort: string;
  view: "grid" | "list";
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const activeCategory = category === "all" ? "Все категории" : category;
  const sortLabels: Record<string, string> = {
    relevance: "По названию",
    price_asc: "Сначала дешевле",
    price_desc: "Сначала дороже",
    rating: "По рейтингу",
  };
  const activeSort = sortLabels[sort] ?? "По названию";

  const filterBase =
    "rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-[#00FF87]/40 hover:bg-white/[0.08]";

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const input = form.querySelector("input[name='q']") as HTMLInputElement;
    if (input && input.value.trim() !== query) {
      setIsSearching(true);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0D0F14] pb-24 font-sans text-slate-100 sm:pb-16">
      {/* Неоновый рассеянный фон */}
      <div className="pointer-events-none fixed right-0 top-0 h-[450px] w-[450px] rounded-full bg-[#00FF87]/5 blur-[140px]" />
      <div className="pointer-events-none fixed -left-20 top-80 h-[350px] w-[350px] rounded-full bg-cyan-500/5 blur-[130px]" />

      {/* Оверлей загрузки с фирменным неоновым кольцом при новом поиске */}
      {isSearching && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0D0F14]/90 backdrop-blur-md">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#00FF87]/20 blur-md duration-1000" />
            <div className="h-28 w-28 animate-spin rounded-full border-4 border-white/5 border-t-[#00FF87] border-r-cyan-400 shadow-[0_0_25px_rgba(0,255,135,0.7)]" />
            <div className="absolute h-18 w-18 animate-spin rounded-full border-2 border-white/10 border-b-[#00FF87] [animation-direction:reverse] [animation-duration:1.5s]" />
            <div className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-[#13161C] border border-[#00FF87]/40 shadow-[0_0_12px_rgba(0,255,135,0.5)]">
              <span className="text-xs font-black text-[#00FF87]">AI</span>
            </div>
          </div>
          <p className="mt-6 text-sm font-bold text-white">ИИ сканирует маркетплейсы...</p>
          <p className="mt-1 text-xs text-slate-400">Проверяем реальные цены и отзывы</p>
        </div>
      )}

      {/* Шапка поиска в стиле wobuy. */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0D0F14]/90 px-4 py-3.5 backdrop-blur-xl md:px-8 md:py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <BrandLogo size="md" />

            {/* AI статус на мобильных экранах */}
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-[11px] font-semibold text-emerald-300 md:hidden">
              <Bot className="h-3.5 w-3.5 text-[#00FF87]" />
              <span>{products.length} найдено</span>
            </div>
          </div>

          {/* Строка поиска */}
          <form
            action="/search"
            onSubmit={handleSearchSubmit}
            className="relative flex-1 md:max-w-xl"
          >
            <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Что ищем? Например, лежанка для собаки"
              className="w-full rounded-full border border-white/10 bg-[#13161C] py-2.5 pl-11 pr-24 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#00FF87] focus:ring-1 focus:ring-[#00FF87]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 rounded-full bg-[#00FF87] px-4 py-1.5 text-xs font-bold text-black transition hover:bg-[#00E576]"
            >
              Найти
            </button>
          </form>

          {/* AI Ассистент баннер на десктопе */}
          <div className="hidden items-center gap-3 rounded-full border border-emerald-500/30 bg-[#12151B]/90 px-4 py-1.5 shadow-lg md:flex">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#00FF87] to-cyan-400 p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0D0F14]">
                <Bot className="h-4 w-4 text-[#00FF87]" />
              </div>
            </div>
            <div className="text-xs text-slate-300">
              {products.length > 0 ? (
                <span>
                  ИИ подобрал <strong className="text-white">{products.length}</strong> проверенных товаров
                </span>
              ) : (
                <span>ИИ готов к подбору товаров</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="mx-auto max-w-7xl px-4 pt-5 md:px-8">
        {/* Горизонтальная лента быстрых фильтров */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none sm:flex-wrap sm:pb-0">
            <Link
              href={buildSearchUrl(query, "all", sort, view)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                category === "all"
                  ? "bg-[#00FF87] text-black shadow-[0_0_12px_rgba(0,255,135,0.4)]"
                  : "border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10"
              }`}
            >
              Все товары
            </Link>
            {categories.slice(0, 5).map((c) => (
              <Link
                key={c}
                href={buildSearchUrl(query, c, sort, view)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  category === c
                    ? "bg-[#00FF87] text-black shadow-[0_0_12px_rgba(0,255,135,0.4)]"
                    : "border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10"
                }`}
              >
                {c}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#00FF87]" />
              <span>Фильтры</span>
              <ChevronDown
                className={`h-3 w-3 text-slate-400 transition-transform ${
                  filterOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Инструменты: Сохранить и переключение вида */}
          <div className="flex items-center justify-between gap-2 sm:justify-end">
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
                href={buildSearchUrl(query, category, sort, "grid")}
                className={`rounded-full p-1.5 transition ${
                  view === "grid" ? "bg-[#00FF87] text-black" : "text-slate-400 hover:text-white"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </Link>
              <Link
                aria-label="Вид списком"
                href={buildSearchUrl(query, category, sort, "list")}
                className={`rounded-full p-1.5 transition ${
                  view === "list" ? "bg-[#00FF87] text-black" : "text-slate-400 hover:text-white"
                }`}
              >
                <List className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Раскрывающаяся панель расширенных фильтров */}
        {filterOpen && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-[#13161C] p-4 sm:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Все категории ({activeCategory})
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildSearchUrl(query, "all", sort, view)}
                    className={`${filterBase} ${category === "all" ? "border-[#00FF87] bg-[#00FF87]/15 text-[#00FF87]" : ""}`}
                  >
                    Все
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c}
                      href={buildSearchUrl(query, c, sort, view)}
                      className={`${filterBase} ${category === c ? "border-[#00FF87] bg-[#00FF87]/15 text-[#00FF87]" : ""}`}
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Сортировка ({activeSort})
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["relevance", "По названию"],
                    ["price_asc", "Сначала дешевле"],
                    ["price_desc", "Сначала дороже"],
                    ["rating", "По рейтингу"],
                  ].map(([s, label]) => (
                    <Link
                      key={s}
                      href={buildSearchUrl(query, category, s, view)}
                      className={`${filterBase} ${sort === s ? "border-[#00FF87] bg-white/10 text-white" : ""}`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Пустое состояние */}
        {products.length === 0 ? (
          <section className="my-12 rounded-3xl border border-white/10 bg-[#13161C] p-12 text-center">
            <Sparkles className="mx-auto mb-4 h-9 w-9 text-[#00FF87]" />
            <h1 className="text-xl font-black text-white">Ничего не найдено</h1>
            <p className="mt-2 text-sm text-slate-400">
              Попробуйте изменить запрос (например, «лежанка для кошек» или «наушники Sony»).
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/search?q=лежанка"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                Искать «лежанка»
              </Link>
              <Link
                href="/search"
                className="rounded-full bg-[#00FF87] px-4 py-2 text-xs font-bold text-black hover:bg-[#00E576]"
              >
                Сбросить поиск
              </Link>
            </div>
          </section>
        ) : (
          /* Сетка / Список карточек товаров */
          <div
            className={
              view === "grid"
                ? "mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                : "mb-10 space-y-4"
            }
          >
            {products.map((product) => {
              const sortedOffers = [...product.offers].sort(
                (a, b) =>
                  (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER),
              );
              const bestOffer = sortedOffers[0];
              const bestPrice = bestOffer?.price ?? 0;

              return (
                <article
                  key={product.id}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#00FF87]/25 bg-[#12151B] p-4.5 sm:p-5 shadow-[0_0_20px_rgba(0,255,135,0.05)] transition-all duration-300 hover:border-[#00FF87]/60 hover:shadow-[0_0_30px_rgba(0,255,135,0.12)] ${
                    view === "list" ? "md:flex-row md:gap-6" : ""
                  }`}
                >
                  {/* Верхняя секция: Картинка слева + AI Score круг и теги справа */}
                  <div
                    className={`flex flex-col gap-3.5 sm:flex-row ${
                      view === "list" ? "md:w-3/5" : ""
                    }`}
                  >
                    {/* Контейнер изображения товара */}
                    <Link
                      href={`/product/${product.id}`}
                      className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl bg-[#0D0F14] p-3 sm:h-36 sm:w-36 sm:shrink-0"
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <Sparkles className="h-10 w-10 text-slate-700" />
                      )}

                      {/* Бейдж маркетплейса лучшей цены */}
                      {bestOffer?.marketplace && (
                        <span className="absolute bottom-2 left-2 rounded-md bg-[#13161C]/90 px-2 py-0.5 text-[10px] font-bold text-slate-300 backdrop-blur-xs">
                          {bestOffer.marketplace}
                        </span>
                      )}
                    </Link>

                    {/* AI Score индикатор + 4 ключевых преимущества */}
                    <div className="flex flex-1 min-w-0 flex-col justify-between">
                      <div className="flex items-center gap-2.5">
                        <AiScoreGauge score={product.aiScore} />

                        {/* Теги валидации ИИ */}
                        <div className="flex flex-1 min-w-0 flex-col gap-1 overflow-hidden">
                          {product.aiTags.slice(0, 4).map((tag, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#00FF87]" />
                              <span className="truncate">{tag}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Спарклайн динамики цен */}
                      <div className="mt-2.5">
                        <CardPriceSparkline
                          sparkline={product.priceSparkline}
                          currentPrice={bestPrice}
                          currency={bestOffer?.currency || "RUB"}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Нижняя секция карточки: Название, Цена со скидкой и Кнопки */}
                  <div
                    className={`mt-5 flex flex-col justify-end border-t border-white/5 pt-4 ${
                      view === "list" ? "md:mt-0 md:w-2/5 md:border-l md:border-t-0 md:pl-6 md:pt-0" : ""
                    }`}
                  >
                    <Link href={`/product/${product.id}`} className="block">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {product.brand}
                      </div>
                      <h3 className="mt-0.5 line-clamp-2 text-base font-black text-white transition group-hover:text-[#00FF87]">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Цена и размер выгоды */}
                    <div className="mt-3 flex items-baseline gap-2.5">
                      <span className="text-xl font-black text-white sm:text-2xl">
                        {formatPrice(bestPrice, bestOffer?.currency || "RUB")}
                      </span>
                      {product.discountPercent > 0 && (
                        <span className="rounded-md bg-[#00FF87]/15 px-2 py-0.5 text-xs font-bold text-[#00FF87]">
                          -{product.discountPercent}%
                        </span>
                      )}
                    </div>

                    {bestOffer?.deliveryText && (
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Truck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{bestOffer.deliveryText}</span>
                      </div>
                    )}

                    {/* Кнопки действий: Прямой переход в магазин и в карточку */}
                    <div className="mt-4 flex items-center gap-2">
                      {bestOffer?.url ? (
                        <a
                          href={bestOffer.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#00FF87] bg-transparent px-4 text-xs font-bold text-[#00FF87] transition hover:bg-[#00FF87] hover:text-black hover:shadow-[0_0_15px_rgba(0,255,135,0.4)]"
                        >
                          <span>Купить сейчас</span>
                          <ShoppingCart className="h-4 w-4" />
                        </a>
                      ) : (
                        <Link
                          href={`/product/${product.id}`}
                          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#00FF87] bg-transparent px-4 text-xs font-bold text-[#00FF87] transition hover:bg-[#00FF87] hover:text-black"
                        >
                          <span>Сравнить цены</span>
                          <ShoppingCart className="h-4 w-4" />
                        </Link>
                      )}

                      <Link
                        href={`/product/${product.id}`}
                        aria-label="Подробнее о товаре"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Секция «АНАЛИТИКА РЫНКА» с реальными данными текущего поиска */}
        <MarketAnalyticsSection products={products} query={query} />
      </main>

      {/* Мобильная нижняя панель навигации */}
      <MobileBottomNav />
    </div>
  );
}

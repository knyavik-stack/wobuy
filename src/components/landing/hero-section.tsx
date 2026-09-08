"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
  X,
  Clock,
  Coins,
} from "lucide-react";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { RadarScanningLogo } from "@/components/brand/RadarScanningLogo";

const POPULAR_QUERIES = [
  "Кемпинговая палатка",
  "Sony WH-1000XM5",
  "Кофемашина DeLonghi",
  "Робот-пылесос",
];

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    window.location.assign(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#0A0C10] text-slate-100 selection:bg-[#00FF87] selection:text-black">
      {/* Деликатный фоновый свет без визуального шума */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-20 top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />

      {/* Верхний лаконичный Header */}
      <header
        id="landing-header"
        className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-[#0A0C10]/90 px-4 backdrop-blur-xl sm:px-8 lg:px-14"
      >
        <BrandLogo size="md" />

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-[#00FF87]/40 hover:bg-white/10 hover:text-white"
          >
            <Search className="h-3.5 w-3.5 text-[#00FF87]" />
            <span className="hidden sm:inline">Поиск</span>
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-[#00FF87] px-4 py-2 text-xs font-bold text-black transition hover:bg-[#00E576]"
          >
            Войти
          </Link>
        </div>
      </header>

      {/* Главный экран: поиск и логотип со сканирующим неоновым кольцом */}
      <section
        id="hero-search-section"
        className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-10 sm:px-8 lg:px-14 lg:pt-28 lg:pb-12"
      >
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Левая колонка: Заголовок, статус, поиск */}
          <div className="flex flex-col space-y-4 lg:col-span-7">
            <div className="inline-flex self-start items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-[#00FF87]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00FF87]" />
              <span>Time-to-Best-Offer &lt; 3 минуты</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.08]">
              Выбирает ИИ.
              <br />
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Покупаешь ты.
              </span>
            </h1>

            {/* Короткое емкое описание без шума */}
            <p className="text-base sm:text-lg font-medium text-slate-300">
              Сервис честной селекции товаров wobuy.
            </p>

            {/* Строка поиска */}
            <form onSubmit={submitSearch} className="group relative w-full pt-1">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#00FF87]/30 to-cyan-500/30 opacity-60 blur transition duration-300 group-focus-within:opacity-100" />
              <div className="relative flex items-center rounded-2xl border border-white/10 bg-[#11141A] p-2 pl-4 transition-all focus-within:border-[#00FF87]/60">
                <Search className="mr-3 h-5 w-5 shrink-0 text-slate-500" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Что ищешь? (например: кемпинговая палатка или кофемашина)"
                  className="w-full border-none bg-transparent pr-4 text-sm text-white outline-none placeholder:text-slate-500 sm:text-base"
                  aria-label="Поиск товаров"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mr-2 text-slate-500 hover:text-white"
                    aria-label="Очистить"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  type="submit"
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#00FF87] px-5 py-3 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-[#00E576] sm:px-6 sm:text-sm"
                >
                  <span>Найти лучшее</span>
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Быстрые запросы */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-400">
              <span className="text-slate-500">Например:</span>
              {POPULAR_QUERIES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    window.location.assign(`/search?q=${encodeURIComponent(term)}`);
                  }}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1 text-slate-300 transition hover:border-[#00FF87]/40 hover:text-[#00FF87]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Правая колонка: Логотип вокруг которого крутящееся неоновое кольцо поиска */}
          <div className="flex items-center justify-center lg:col-span-5">
            <RadarScanningLogo />
          </div>
        </div>
      </section>

      {/* ОБЪЕДИНЕННЫЙ БЛОК: Экономика времени, бюджета и стандарты надежности wobuy. */}
      <section
        id="value-standards-section"
        className="relative z-10 mx-auto max-w-7xl border-t border-white/5 px-4 py-12 sm:px-8 lg:px-14"
      >
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#00FF87]">
              Стандарты и экономика селекции
            </span>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              Честный выбор вместо часов сомнений
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Математический анализ тысяч предложений без рекламы, ботов и скрытых переплат.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[#00FF87]">
              <Clock className="h-3.5 w-3.5" />
              <span>3+ часа экономии времени</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-cyan-400">
              <Coins className="h-3.5 w-3.5" />
              <span>Защита от переплат до 35%</span>
            </div>
          </div>
        </div>

        {/* 4 емкие карточки стандартов с мгновенным считыванием сути */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Время */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0F1218]/80 p-5 transition hover:border-[#00FF87]/50 hover:bg-[#121620]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-[#00FF87]">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-[#00FF87]">
                  &lt; 3 минут
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Время и фокус</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Один человеческий запрос вместо десятка вкладок, сотен фильтров и часов утомительного скроллинга.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-medium text-[#00FF87]">
              3 часа поиска → 1 вердикт
            </div>
          </div>

          {/* 2. Анти-Фейк */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0F1218]/80 p-5 transition hover:border-purple-400/50 hover:bg-[#121620]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold text-purple-300">
                  96% чистота
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Анти-Фейк фильтр</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Нейросеть на лету отсекает заказные отзывы бот-ферм и выявляет скрытый фабричный процент брака.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-medium text-purple-300">
              Отсев платных накруток
            </div>
          </div>

          {/* 3. Честная цена TCO */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0F1218]/80 p-5 transition hover:border-cyan-400/50 hover:bg-[#121620]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Coins className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                  TCO-сверка
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Реальная цена покупки</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Калькулятор TCO считает полную стоимость с учетом скидок по картам, логистики и рисков возврата.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-medium text-cyan-300">
              Без мнимых скидок маркетплейсов
            </div>
          </div>

          {/* 4. Дуэль WB vs Ozon */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0F1218]/80 p-5 transition hover:border-amber-400/50 hover:bg-[#121620]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                  WB vs Ozon
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Арбитраж площадок</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Прямая дуэль между Wildberries и Ozon с четким указанием победителя по цене, рейтингу и скорости доставки.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-medium text-amber-300">
              Побеждает лучший продавец
            </div>
          </div>
        </div>
      </section>

      {/* ОБЪЕДИНЕННЫЙ БЛОК: Манифест независимости + призыв к действию за 3 минуты */}
      <section
        id="manifesto-cta"
        className="relative z-10 mx-auto max-w-7xl border-t border-white/5 px-4 py-12 sm:px-8 lg:px-14"
      >
        <div className="relative overflow-hidden rounded-3xl border border-[#00FF87]/40 bg-gradient-to-br from-emerald-950/40 via-[#10141C] to-[#0D1016] p-6 sm:p-10 shadow-2xl">
          {/* Деликатное неоновое свечение в углу */}
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#00FF87]/10 blur-[100px]" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#00FF87] animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-[#00FF87]">
                  Манифест независимости wobuy.
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Мы не продаем товары.<br className="hidden sm:inline" />
                Мы защищаем твой выбор.
              </h2>

              <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-300">
                Маркетплейсы зарабатывают на рекламе продавцов и накрученных акциях. wobuy. работает исключительно в интересах покупателя: независимый математический расчет, чистый отсев ботов и выбор лучшего предложения за 3 минуты.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                  ✓ 0% рекламы селлеров
                </span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                  ✓ Математический AI Score
                </span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                  ✓ Прямая дуэль WB vs Ozon
                </span>
              </div>
            </div>

            {/* Быстрый переход к поиску */}
            <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
              <Link
                href="/search"
                className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#00FF87] px-8 py-4 text-sm sm:text-base font-black text-black shadow-[0_0_25px_rgba(0,255,135,0.35)] transition-all hover:bg-[#00E576] hover:scale-[1.02]"
              >
                <span>Найти лучшее за 3 минуты</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <span className="text-xs text-slate-400 font-medium">
                Бесплатно • Без обязательной регистрации
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Мобильная навигация */}
      <MobileBottomNav />
    </div>
  );
}

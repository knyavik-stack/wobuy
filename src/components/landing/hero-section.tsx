"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
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

      {/* Инфографический блок 1: Как wobuy. экономит твои часы и деньги */}
      <section
        id="savings-infographic"
        className="relative z-10 mx-auto max-w-7xl border-t border-white/5 px-4 py-10 sm:px-8 lg:px-14"
      >
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00FF87]">
              Экономика времени и бюджета
            </span>
            <h2 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
              Как <BrandLogo size="md" className="inline-flex" /> экономит твои часы и деньги
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#00FF87]" />
              <span>Экономия 3+ часов на поиск</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-cyan-400" />
              <span>Защита от переплат до 35%</span>
            </div>
          </div>
        </div>

        {/* Иерархическая инфографическая схема */}
        <div className="relative rounded-3xl border border-white/10 bg-[#0F1218]/70 p-6 sm:p-8 backdrop-blur-xl">
          {/* Сквозная неоновая направляющая линия (на десктопе горизонтальная, на мобильных вертикальная) */}
          <div className="pointer-events-none absolute left-8 right-8 top-1/2 hidden h-[2px] -translate-y-1/2 bg-gradient-to-r from-[#00FF87]/20 via-[#00FF87] to-[#00FF87]/20 lg:block" />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Узел 1 */}
            <div className="relative z-10 flex flex-col items-start rounded-2xl border border-white/5 bg-[#141820]/90 p-5 transition hover:border-[#00FF87]/40">
              <div className="mb-3 flex items-center justify-between w-full">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00FF87]/10 font-black text-xs text-[#00FF87] border border-[#00FF87]/30">
                  01
                </span>
                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">
                  Входной интент
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Человеческий запрос</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Задаешь задачу живым языком — ИИ понимает контекст без ручной настройки десятков фильтров.
              </p>
            </div>

            {/* Узел 2 */}
            <div className="relative z-10 flex flex-col items-start rounded-2xl border border-[#00FF87]/30 bg-[#141820]/90 p-5 shadow-[0_0_30px_rgba(0,255,135,0.05)] transition hover:border-[#00FF87]/60">
              <div className="mb-3 flex items-center justify-between w-full">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00FF87] font-black text-xs text-black shadow-[0_0_12px_#00FF87]">
                  02
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-[#00FF87]">
                  4 Агента в параллели
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Мультиагентный скан</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Скептик и Аналитик синхронно отсекают ботов, проверяют фабричный брак и разоблачают накрученные скидки.
              </p>
            </div>

            {/* Узел 3 */}
            <div className="relative z-10 flex flex-col items-start rounded-2xl border border-white/5 bg-[#141820]/90 p-5 transition hover:border-[#00FF87]/40">
              <div className="mb-3 flex items-center justify-between w-full">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 font-black text-xs text-cyan-400 border border-cyan-500/30">
                  03
                </span>
                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">
                  Финал за 3 минуты
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Арбитраж TCO и Дуэль</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Получаешь 3 проверенных товара с честной ценой владения и мгновенным выбором между WB и Ozon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Инфографический блок 2: Почему покупатели доверяют (Инфографика 4 векторов доверия) */}
      <section
        id="trust-infographic"
        className="relative z-10 mx-auto max-w-7xl border-t border-white/5 px-4 py-10 sm:px-8 lg:px-14"
      >
        <div className="mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00FF87]">
            Стандарты надежности
          </span>
          <h2 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
            Почему покупатели доверяют <BrandLogo size="md" className="inline-flex" />
          </h2>
        </div>

        {/* Инфографическая сетка 4 векторов независимости */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative rounded-2xl border border-white/10 bg-[#0F1218]/60 p-5 transition hover:border-[#00FF87]/40">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-[#00FF87]">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Непредвзятый AI Score</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Рейтинг рассчитывается математически без влияния рекламных бюджетов селлеров.
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-[#0F1218]/60 p-5 transition hover:border-purple-400/40">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Нейросеть Анти-Фейк</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Выявляет и отсекает накрученные пятизвездочные отзывы коммерческих бот-ферм.
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-[#0F1218]/60 p-5 transition hover:border-cyan-400/40">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Детектор цен</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Разоблачает искусственные завышения цен перед распродажами и акциями.
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-[#0F1218]/60 p-5 transition hover:border-amber-400/40">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Дуэль платформ</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Сравнивает идентичные товары на WB и Ozon по честной стоимости владения.
            </p>
          </div>
        </div>
      </section>

      {/* Лаконичный минималистичный манифест */}
      <section
        id="manifesto"
        className="relative z-10 mx-auto max-w-7xl border-t border-white/5 px-4 py-10 sm:px-8 lg:px-14"
      >
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#11141B] to-[#0A0C10] p-6 sm:p-10">
          <div className="max-w-3xl space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00FF87]">
              Манифест независимости
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Мы не продаем товары. Мы защищаем твой выбор.
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-300">
              Маркетплейсы зарабатывают на рекламе продавцов и скрытых комиссиях. wobuy. работает исключительно на покупателя: фильтрует накрученные отзывы, разоблачает мнимые скидки и находит честные предложения.
            </p>
          </div>
        </div>
      </section>

      {/* Импульсивный CTA-блок */}
      <section
        id="quick-cta"
        className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-14"
      >
        <div className="relative overflow-hidden rounded-3xl border border-[#00FF87]/30 bg-gradient-to-r from-emerald-950/50 via-[#10141C] to-[#0D1016] p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white sm:text-3xl">
                Найди лучшее за 3 минуты без риска и переплат.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Один запрос отсекает тысячи ботов и находит минимальную цену на проверенный товар.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-xl bg-[#00FF87] px-6 py-3.5 text-xs sm:text-sm font-bold text-black shadow-lg shadow-emerald-500/25 transition hover:bg-[#00E576]"
              >
                <span>Найти лучшее сейчас</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Мобильная навигация */}
      <MobileBottomNav />
    </div>
  );
}

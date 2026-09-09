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
              Выбирает wobuy.
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

      {/* ОБЪЕДИНЕННЫЙ БЛОК 1: Экономика времени, бюджета и стандарты надежности (Мгновенное понимание при взгляде) */}
      <section
        id="value-standards-section"
        className="relative z-10 mx-auto max-w-7xl border-t border-white/5 px-4 py-12 sm:px-8 lg:px-14"
      >
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-[#00FF87]">
            <Sparkles className="h-3 w-3" />
            <span>Экономика и защита выбора</span>
          </div>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl lg:text-4xl tracking-tight">
            wobuy. - выбирает лучшее, отсекает лишнее
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl">
            wobuy. за 3 минуты делает работу, на которую раньше уходили часы сравнений и сомнений.
          </p>
        </div>

        {/* 3 мощные визуальные карточки с моментальным считыванием сути: Время • Деньги • Безопасность */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Карточка 1: ВРЕМЯ */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0F1218]/90 p-6 transition-all duration-300 hover:border-emerald-500/40 hover:bg-[#121620]">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-[#00FF87] border border-emerald-500/20">
                <Clock className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-[#00FF87]">
                3 мин вместо 3 ч
              </span>
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-black text-white">Экономия времени</h3>
              <p className="mt-1 text-xs text-slate-400">
                Один запрос вместо десятков вкладок и бесконечного скроллинга.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-white/5 bg-black/40 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Обычный поиск:</span>
                <span className="text-red-400 font-semibold line-through">40 вкладок и сомнения</span>
              </div>
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5 text-[#00FF87]">
                  <Zap className="h-3.5 w-3.5" />
                  С wobuy.:
                </span>
                <span className="text-[#00FF87]">1 точный вердикт</span>
              </div>
            </div>
          </div>

          {/* Карточка 2: ДЕНЬГИ И ЦЕНА */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0F1218]/90 p-6 transition-all duration-300 hover:border-cyan-500/40 hover:bg-[#121620]">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Coins className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-300">
                Выгода до 35%
              </span>
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-black text-white">Честная стоимость</h3>
              <p className="mt-1 text-xs text-slate-400">
                Прямая дуэль Wildberries vs Ozon с расчетом карт и скрытых условий.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-white/5 bg-black/40 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Обычный поиск:</span>
                <span className="text-red-400 font-semibold">Фальшивые скидки селлеров</span>
              </div>
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Coins className="h-3.5 w-3.5" />
                  С wobuy.:
                </span>
                <span className="text-cyan-300">Реальная цена покупки</span>
              </div>
            </div>
          </div>

          {/* Карточка 3: БЕЗОПАСНОСТЬ И АНТИ-ФЕЙК */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0F1218]/90 p-6 transition-all duration-300 hover:border-purple-500/40 hover:bg-[#121620]">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-black text-purple-300">
                Анти-Фейк 96%
              </span>
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-black text-white">Защита от брака и ботов</h3>
              <p className="mt-1 text-xs text-slate-400">
                ИИ отсекает накрученные 5★ отзывы и предупреждает о скрытых дефектах.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-white/5 bg-black/40 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Обычный поиск:</span>
                <span className="text-red-400 font-semibold">Купленные бот-отзывы</span>
              </div>
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5 text-purple-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  С wobuy.:
                </span>
                <span className="text-purple-300">Очищенный рейтинг товара</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ОБЪЕДИНЕННЫЙ БЛОК 2: Манифест независимости + Найди лучшее за 3 минуты (Финальный акцент) */}
      <section
        id="manifesto-cta"
        className="relative z-10 mx-auto max-w-7xl border-t border-white/5 px-4 py-12 sm:px-8 lg:px-14"
      >
        <div className="relative overflow-hidden rounded-3xl border border-[#00FF87]/30 bg-gradient-to-br from-emerald-950/40 via-[#10141C] to-[#0B0D12] p-7 sm:p-12 shadow-2xl">
          {/* Деликатный фоновый свет */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-[#00FF87]/15 blur-[90px]" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-[#00FF87]">
                <span className="h-2 w-2 rounded-full bg-[#00FF87] animate-pulse" />
                <span>Манифест независимости wobuy.</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                wobuy. на твоей стороне <br className="hidden sm:inline" />
               # а не на стороне продавцов.
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                В wobuy. — только честная математика, сравнение Wildberries vs Ozon и выбор лучшего за 3 минуты.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                  <span className="text-[#00FF87]">✓</span> 0% рекламы продавцов
                </span>
                <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                  <span className="text-[#00FF87]">✓</span> Независимый AI Score
                </span>
                <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                  <span className="text-[#00FF87]">✓</span> Прямая дуэль цен WB vs Ozon
                </span>
              </div>
            </div>

            {/* Призыв к действию */}
            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
              <Link
                href="/search"
                className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-[#00FF87] px-8 py-4 text-sm sm:text-base font-black text-black shadow-[0_0_30px_rgba(0,255,135,0.4)] transition-all duration-200 hover:bg-[#00E576] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Найти лучшее за 3 минуты</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <span className="text-xs text-slate-400 font-medium">
                Бесплатно • Без спама • Всегда актуальные цены
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

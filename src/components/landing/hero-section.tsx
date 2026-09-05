"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";

type Archetype = "urgent" | "perfectionist" | "budget" | "antifake";

const ARCHETYPES: Record<
  Archetype,
  {
    label: string;
    emoji: string;
    placeholder: string;
    description: string;
    accentColor: string;
    glowColor: string;
    product: {
      title: string;
      score: number;
      price: string;
      oldPrice: string;
      platform: string;
      delivery: string;
      reasons: string[];
      antiFake: string;
    };
  }
> = {
  perfectionist: {
    label: "Перфекционист",
    emoji: "💎",
    placeholder: "Ищу лучшую палатку по качеству и реальным отзывам...",
    description: "Приоритет на качество, надежность и отсутствие брака",
    accentColor: "from-emerald-400 to-teal-500",
    glowColor: "rgba(0, 255, 135, 0.25)",
    product: {
      title: "Экспедиционная палатка Tramp Mountain 3 v2",
      score: 9.7,
      price: "14 890 ₽",
      oldPrice: "17 500 ₽",
      platform: "Ozon",
      delivery: "Послезавтра",
      reasons: [
        "Алюминиевый каркас повышенной прочности",
        "Двухслойная мембрана RipStop 8000 мм",
        "0% жалоб на фабричный брак за 6 месяцев",
      ],
      antiFake: "98% проверенных покупателей",
    },
  },
  budget: {
    label: "Экономный",
    emoji: "🏷️",
    placeholder: "Палатка 3-местная со скидкой, дешевле чем везде...",
    description: "Приоритет на минимальную цену и честные скидки без накруток",
    accentColor: "from-blue-500 to-indigo-600",
    glowColor: "rgba(59, 130, 246, 0.2)",
    product: {
      title: "Кемпинговая палатка Trek Planet",
      score: 9.1,
      price: "4 120 ₽",
      oldPrice: "6 800 ₽",
      platform: "Wildberries",
      delivery: "2 дня",
      reasons: [
        "Честная выгода -39% от средней цены по рынку",
        "Исторический минимум цены за последние 12 месяцев",
        "Честный рейтинг продавца: 4.8 / 5.0",
      ],
      antiFake: "Отзывы проверены ИИ",
    },
  },
  urgent: {
    label: "Срочный",
    emoji: "⚡",
    placeholder: "Нужна палатка с доставкой до завтра...",
    description: "Приоритет на максимальную скорость доставки до ПВЗ",
    accentColor: "from-amber-500 to-orange-600",
    glowColor: "rgba(245, 158, 11, 0.2)",
    product: {
      title: "Быстросборная 3-местная палатка MirCamping",
      score: 8.9,
      price: "7 450 ₽",
      oldPrice: "9 200 ₽",
      platform: "Ozon",
      delivery: "Сегодня до 21:00",
      reasons: [
        "Автоматическая сборка за 45 секунд",
        "Экспресс-отгрузка со склада маркетплейса",
        "Влагозащита дна 5000 мм",
      ],
      antiFake: "94% реальных отзывов",
    },
  },
  antifake: {
    label: "Анти-Фейк",
    emoji: "🛡️",
    placeholder: "Оригинальная электроника с гарантией и без подделок...",
    description: "Приоритет на подлинность товара и отсечение накрученных отзывов",
    accentColor: "from-purple-500 to-pink-500",
    glowColor: "rgba(168, 85, 247, 0.2)",
    product: {
      title: "Беспроводные наушники Sony WH-1000XM5",
      score: 9.6,
      price: "32 490 ₽",
      oldPrice: "38 900 ₽",
      platform: "Яндекс Маркет",
      delivery: "Завтра",
      reasons: [
        "Официальная серийная верификация подлинности",
        "Отфильтровано 140+ накрученных бот-отзывов",
        "Оригинальная гарантия производителя в РФ",
      ],
      antiFake: "99% подлинности: проверено ИИ",
    },
  },
};

const NAV_ITEMS = [
  { id: "features", label: "Как это работает" },
  { id: "advantages", label: "Преимущества" },
  { id: "pricing", label: "Тарифы" },
  { id: "about", label: "О нас" },
];

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<Archetype>("perfectionist");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const config = ARCHETYPES[activeTab];

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    window.location.assign(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const headerOffset = 80;
    const top = element.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#0D0F14] px-4 pb-4 pt-16 text-slate-100 selection:bg-[#00FF87] selection:text-black md:px-8 md:pt-20 lg:px-16">
      {/* Мягкие фоновые неоновые пятна */}
      <div className="pointer-events-none absolute left-[-10%] top-[-15%] h-[55%] w-[55%] rounded-full bg-gradient-to-tr from-emerald-500/10 to-transparent blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-gradient-to-br from-blue-600/5 to-transparent blur-[160px]" />

      {/* Верхний Header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex min-h-16 items-center justify-between border-b border-white/5 bg-[#0D0F14]/95 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-xl md:px-8 lg:px-16">
        <Link href="/" className="text-2xl font-black tracking-tight text-white">
          wobuy<span className="text-[#00FF87] drop-shadow-[0_0_8px_#00FF87]">.</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-6">
          <nav
            className="hidden items-center gap-5 text-sm font-medium text-slate-400 md:flex lg:gap-7"
            aria-label="Основная навигация"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="transition-colors hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <Link
            href="/login"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10 md:px-5"
          >
            Войти
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {/* Выпадающее мобильное меню */}
        <AnimatePresence>
          {mobileMenuOpen ? (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute left-4 right-4 top-[calc(100%+8px)] rounded-2xl border border-white/10 bg-[#13161C]/98 p-2 shadow-2xl backdrop-blur-xl md:hidden"
              aria-label="Мобильная навигация"
            >
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>

      {/* Главный Hero-блок */}
      <main className="relative z-10 mx-auto grid min-h-[calc(100svh-64px)] w-full max-w-7xl grid-cols-1 items-center gap-6 py-6 lg:grid-cols-12 lg:gap-8">
        <div className="col-span-1 flex flex-col justify-center space-y-5 lg:col-span-7">
          <div className="inline-flex self-start items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-[#00FF87]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#00FF87]" />
            Time-to-Best-Offer &lt; 3 минуты
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
            Выбирает ИИ.
            <br />
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Покупаешь ты.
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-slate-400 md:text-lg">
            wobuy. анализирует предложения Ozon, Wildberries и Яндекс Маркета, отсекает фейковые отзывы,
            рассчитывает непредвзятый AI Score и находит 3 лучших варианта за 3 минуты.
          </p>

          {/* Строка поиска */}
          <form onSubmit={submitSearch} className="group relative w-full max-w-2xl">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#00FF87]/30 to-blue-500/30 opacity-75 blur transition duration-500 group-focus-within:opacity-100" />
            <div className="relative flex items-center rounded-2xl border border-white/10 bg-[#13161C]/90 p-2 pl-4 transition-all focus-within:border-[#00FF87]/50">
              <Search className="mr-3 h-5 w-5 shrink-0 text-slate-500" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={config.placeholder}
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
                className="flex shrink-0 items-center justify-center rounded-xl bg-[#00FF87] px-5 py-3 text-xs font-bold text-black shadow-lg shadow-emerald-500/10 transition-all hover:bg-[#00E576] sm:px-6 sm:text-sm"
              >
                <span className="mr-2 hidden sm:inline">Найти лучшее</span>
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Быстрые теги запросов */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-medium text-slate-500">Например:</span>
            {["Кемпинговая палатка", "Sony WH-1000XM5", "Кофемашина DeLonghi", "Робот-пылесос"].map(
              (term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    window.location.assign(`/search?q=${encodeURIComponent(term)}`);
                  }}
                  className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-slate-300 transition hover:border-[#00FF87]/40 hover:text-[#00FF87]"
                >
                  {term}
                </button>
              ),
            )}
          </div>

          {/* Селектор архетипов с горизонтальным скроллом на мобильных */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Выбери свой фокус ИИ-анализа:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
              {(Object.keys(ARCHETYPES) as Archetype[]).map((key) => {
                const item = ARCHETYPES[key];
                const selected = activeTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
                      selected
                        ? "border border-white/20 bg-white/10 text-white"
                        : "border border-transparent bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                    {selected ? (
                      <motion.div
                        layoutId="activeGlow"
                        className="pointer-events-none absolute inset-0 rounded-xl border-2 border-[#00FF87]/30"
                        style={{ boxShadow: `0 0 15px ${item.glowColor}` }}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-xs italic text-slate-500">💡 {config.description}</p>
          </div>
        </div>

        {/* Превью-карточка рекомендации ИИ */}
        <div className="relative col-span-1 flex min-h-[350px] items-center justify-center lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="relative w-full max-w-[390px] rounded-3xl border border-white/10 bg-[#13161C]/80 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-4 flex items-start justify-between">
                <span
                  className={`rounded-lg bg-gradient-to-r ${config.accentColor} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white`}
                >
                  Рекомендация ИИ
                </span>
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      stroke="#00FF87"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray="138.2"
                      strokeDashoffset={138.2 - (138.2 * config.product.score) / 10}
                      strokeLinecap="round"
                      style={{ filter: "drop-shadow(0 0 6px rgba(0,255,135,0.65))" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-black text-white">
                      {config.product.score}
                    </span>
                    <span className="text-[7px] font-extrabold text-[#00FF87]">AI SCORE</span>
                  </div>
                </div>
              </div>

              <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-medium text-white">
                  {config.product.platform}
                </span>
                <span className="flex items-center">
                  <Truck className="mr-1 h-3.5 w-3.5 text-emerald-400" />
                  {config.product.delivery}
                </span>
              </div>

              <h3 className="mb-3 line-clamp-2 text-base font-bold leading-snug text-white">
                {config.product.title}
              </h3>

              <div className="mb-4 flex items-baseline gap-3">
                <span className="text-2xl font-black text-[#00FF87]">{config.product.price}</span>
                <span className="text-xs text-slate-500 line-through">
                  {config.product.oldPrice}
                </span>
              </div>

              <hr className="my-4 border-white/5" />

              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-3 py-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#00FF87]" />
                <span className="text-xs font-medium text-slate-300">
                  {config.product.antiFake}
                </span>
              </div>

              <div className="space-y-2.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Аргументы ИИ-агентов:
                </span>
                {config.product.reasons.map((reason) => (
                  <div key={reason} className="flex items-start gap-2">
                    <span className="mt-0.5 text-sm text-[#00FF87]">•</span>
                    <p className="text-xs leading-relaxed text-slate-300">{reason}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery(config.product.title);
                  window.location.assign(`/search?q=${encodeURIComponent(config.product.title)}`);
                }}
                className="group mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white transition-all hover:bg-white/10"
              >
                <span>Посмотреть подборку в поиске</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Секция: Как это работает */}
      <section
        id="features"
        className="relative z-10 mx-auto max-w-7xl scroll-mt-24 border-t border-white/5 py-14"
      >
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00FF87]">
            Механика сервиса
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">
            Как wobuy. экономит твои часы и деньги
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Всего 3 прозрачных шага к идеальной покупке без риска нарваться на подделку или завышенную цену.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition hover:border-[#00FF87]/30">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#00FF87]/20 bg-[#00FF87]/10 text-sm font-black text-[#00FF87]">
              01
            </div>
            <h3 className="text-lg font-bold text-white">Человеческий запрос</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Опиши потребность обычными словами: «нужна тихая кофемашина для дома до 25 000 ₽» или «палатка для шторма».
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition hover:border-[#00FF87]/30">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#00FF87]/20 bg-[#00FF87]/10 text-sm font-black text-[#00FF87]">
              02
            </div>
            <h3 className="text-lg font-bold text-white">Мультиагентный скан</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              4 ИИ-агента одновременно проверяют Ozon, WB и Яндекс Маркет, отсекая бот-отзывы, проверяя брак и динамику цен.
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition hover:border-[#00FF87]/30">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#00FF87]/20 bg-[#00FF87]/10 text-sm font-black text-[#00FF87]">
              03
            </div>
            <h3 className="text-lg font-bold text-white">Решение за 3 минуты</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Получаешь топ-3 проверенных товара с честным AI Score, аргументами за и против и прямыми ссылками на лучшую цену.
            </p>
          </div>
        </div>
      </section>

      {/* Секция: Преимущества (Почему wobuy.) */}
      <section
        id="advantages"
        className="relative z-10 mx-auto max-w-7xl scroll-mt-24 border-t border-white/5 py-14"
      >
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00FF87]">
            Наши принципы
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">
            Почему покупатели доверяют wobuy.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Мы не продаём товары и не берем комиссию от продавцов за продвижение. Наш клиент — ты.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20">
            <Bot className="mb-3 h-6 w-6 text-[#00FF87]" />
            <h3 className="text-base font-bold text-white">Непредвзятый AI Score</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Никаких проплаченных позиций и рекламных баннеров. Место в топе заслуживается только фактами.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20">
            <ShieldCheck className="mb-3 h-6 w-6 text-purple-400" />
            <h3 className="text-base font-bold text-white">Нейросеть «Анти-Фейк»</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Очищает отзывы от заказных публикаций бот-ферм и селлеров, вычисляя долю реальных покупателей.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20">
            <BarChart3 className="mb-3 h-6 w-6 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Честная динамика цен</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Защита от искусственных «скидок» перед распродажами. Видишь реальный исторический минимум.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20">
            <Zap className="mb-3 h-6 w-6 text-amber-400" />
            <h3 className="text-base font-bold text-white">Единое окно рынка</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Сравнивай предложения ведущих маркетплейсов в одном месте без переключения между десятками вкладок.
            </p>
          </div>
        </div>
      </section>

      {/* Секция: Тарифы */}
      <section
        id="pricing"
        className="relative z-10 mx-auto max-w-7xl scroll-mt-24 border-t border-white/5 py-14"
      >
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00FF87]">Тарифы</span>
          <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">
            Прозрачные и честные условия
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
            Базовый поиск бесплатен навсегда. Дополнительные возможности созданы для продвинутых покупателей.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Базовый тариф */}
          <div className="flex flex-col justify-between rounded-3xl border border-emerald-500/30 bg-[#13161C]/80 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div>
              <div className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00FF87]">
                Бесплатно навсегда
              </div>
              <h3 className="mt-4 text-2xl font-extrabold text-white">Базовый поиск</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">0 ₽</span>
                <span className="text-xs text-slate-500">без ограничений по времени</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00FF87]" />
                  <span>Полноценный AI-поиск по каталогу товаров</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00FF87]" />
                  <span>Проверка отзывов фильтром «Анти-Фейк»</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00FF87]" />
                  <span>Сравнение предложений Ozon, WB и Яндекс Маркета</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00FF87]" />
                  <span>Сохранение товаров и истории в личном кабинете</span>
                </li>
              </ul>
            </div>
            <Link
              href="/search"
              className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-[#00FF87] py-3 text-xs font-bold text-black transition hover:bg-[#00E576]"
            >
              <span>Начать поиск</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Тариф PRO */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#13161C]/40 p-6 backdrop-blur-xl sm:p-8">
            <div>
              <div className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Скоро в релизе
              </div>
              <h3 className="mt-4 text-2xl font-extrabold text-white">wobuy. PRO</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-300">290 ₽</span>
                <span className="text-xs text-slate-500">/ месяц</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-500" />
                  <span>Все возможности базового тарифа</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00FF87]" />
                  <span>Автоматический мониторинг снижения цен 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00FF87]" />
                  <span>Мгновенные уведомления о скидках в Telegram</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00FF87]" />
                  <span>Глубокий анализ истории селлеров и возвратов</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              disabled
              className="mt-8 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-500"
            >
              Доступно после тестирования
            </button>
          </div>
        </div>
      </section>

      {/* Секция: О нас */}
      <section
        id="about"
        className="relative z-10 mx-auto max-w-7xl scroll-mt-24 border-t border-white/5 py-14"
      >
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00FF87]">Манифест</span>
          <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">
            wobuy. — сервис осознанного выбора
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 md:text-base">
            Мы создали wobuy., потому что устали от бесконечных рекламных плашек, накрученных пятизвёздочных оценок и фальшивых «скидок» на маркетплейсах.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 md:text-base">
            Наша цель — вернуть покупателю контроль над своими деньгами и временем. Искусственный интеллект должен работать на тебя, отсеивая информационный шум и находя действительно честные и качественные вещи.
          </p>
        </div>
      </section>

      {/* CTA-баннер */}
      <section className="relative z-10 mx-auto my-6 max-w-7xl rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-[#13161C] to-[#13161C] p-8 text-center sm:p-12">
        <h2 className="text-2xl font-black text-white sm:text-3xl md:text-4xl">
          Хватит тратить часы на чтение накрученных отзывов
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
          Опиши свою задачу и позволь 4 независимым ИИ-агентам найти лучшее предложение прямо сейчас.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-xl bg-[#00FF87] px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-[#00E576]"
          >
            <span>Попробовать поиск wobuy.</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Футер */}
      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-3 border-t border-white/5 pb-24 pt-6 text-xs text-slate-500 sm:pb-6 md:flex-row md:items-center md:justify-between">
        <div>© 2026 wobuy. — Умный ИИ-помощник для покупок на маркетплейсах.</div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacy" className="hover:text-white">
            Конфиденциальность
          </Link>
          <Link href="/terms" className="hover:text-white">
            Условия использования
          </Link>
          <Link href="/login" className="hover:text-white">
            Войти в кабинет
          </Link>
        </div>
      </footer>

      {/* Мобильная панель навигации */}
      <MobileBottomNav />
    </section>
  );
}


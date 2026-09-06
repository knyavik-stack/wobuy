import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  Bookmark,
  Clock3,
  Heart,
  Search,
  Settings,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardLogoutButton } from "@/components/dashboard/dashboard-logout-button";
import ProfileSettings from "@/components/dashboard/profile-settings";
import { DashboardFavoritesList } from "@/components/dashboard/dashboard-favorites-list";
import { DashboardHistoryList } from "@/components/dashboard/dashboard-history-list";
import { DashboardSearchesList } from "@/components/dashboard/dashboard-searches-list";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { getDemoProductById } from "@/lib/catalog/demo-data";
import { computeProductAiMetrics } from "@/lib/catalog/search";
import { BrandLogo } from "@/components/brand/BrandLogo";

type HistoryProduct = {
  id: string;
  canonical_name: string;
  brand: string;
  category: string;
  image_url: string | null;
};

export default async function DashboardPage() {
  let user = null;
  let supabase = null;
  try {
    supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  }
  if (!user) redirect("/login");

  let favorites: Array<{
    product_id: string;
    created_at: string;
    products: HistoryProduct | HistoryProduct[] | null;
  }> | null = null;
  let searches: Array<{ id: string; query: string; created_at: string }> | null = null;
  let history: Array<{
    id: string;
    viewed_at: string;
    products: HistoryProduct | HistoryProduct[] | null;
  }> | null = null;

  try {
    if (supabase) {
      const [favRes, searchRes, histRes] = await Promise.all([
        supabase
          .from("user_favorites")
          .select(
            "product_id, created_at, products(id, canonical_name, brand, category, image_url)",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("saved_searches")
          .select("id, query, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("product_view_history")
          .select("id, viewed_at, products(id, canonical_name, brand, category, image_url)")
          .eq("user_id", user.id)
          .order("viewed_at", { ascending: false })
          .limit(20),
      ]);
      favorites = favRes.data;
      searches = searchRes.data;
      history = histRes.data;
    }
  } catch (err) {
    console.warn("Ошибка загрузки данных кабинета:", err);
  }

  const displayName =
    typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name.trim()
      ? user.user_metadata.display_name.trim()
      : user.email?.split("@")[0] ?? "Пользователь";

  const totalFavorites = favorites?.length ?? 0;
  const totalSearches = searches?.length ?? 0;
  const totalHistory = history?.length ?? 0;

  return (
    <main className="min-h-screen bg-[#0D0F14] text-slate-100 selection:bg-[#00FF87] selection:text-black">
      {/* Фоновый мягкий градиент-спотлайт */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[20%] -top-[20%] h-[60vw] w-[60vw] rounded-full bg-[#00FF87]/[0.02] blur-[140px]" />
        <div className="absolute -right-[20%] top-[40%] h-[50vw] w-[50vw] rounded-full bg-[#00FF87]/[0.015] blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-28 pt-6 sm:pb-20 md:px-8 md:pt-8">
        {/* Хедер личного кабинета */}
        <header className="mb-8 rounded-3xl border border-white/10 bg-[#13161C]/80 p-6 backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <BrandLogo size="md" />
                <span className="rounded-full border border-[#00FF87]/30 bg-[#00FF87]/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#00FF87]">
                  Кабинет
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                Привет, <span className="text-[#00FF87]">{displayName}</span> 👋
              </h1>
              <p className="max-w-2xl text-xs leading-relaxed text-slate-400 sm:text-sm">
                Твой персональный центр умного шопинга. Здесь собраны отслеживаемые товары, сохранённые поиски и история просмотров с нейроанализом цен.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/search"
                className="flex items-center gap-2 rounded-xl bg-[#00FF87] px-4 py-2.5 text-xs font-black text-black shadow-[0_0_20px_rgba(0,255,135,0.25)] transition hover:bg-[#00E576] active:scale-95"
              >
                <Search className="h-4 w-4" />
                <span>Найти товар</span>
              </Link>
              <DashboardLogoutButton />
            </div>
          </div>

          {/* Быстрые метрики */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            <StatCard
              icon={<Heart className="h-5 w-5 text-[#00FF87]" />}
              label="В избранном"
              value={totalFavorites}
              subtext="Товары на контроле"
            />
            <StatCard
              icon={<Bookmark className="h-5 w-5 text-[#00FF87]" />}
              label="Сохранено поисков"
              value={totalSearches}
              subtext="Быстрый доступ к выдаче"
            />
            <StatCard
              icon={<Clock3 className="h-5 w-5 text-[#00FF87]" />}
              label="Просмотрено"
              value={totalHistory}
              subtext="История визитов"
            />
            <StatCard
              icon={<Sparkles className="h-5 w-5 text-[#00FF87]" />}
              label="AI Ассистент"
              value="PRO 2.0"
              subtext="Нейросеть активна"
            />
          </div>
        </header>

        {/* Сетка основных разделов кабинета */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Левая колонка (2/3): Сохранённые товары */}
          <div className="space-y-8 lg:col-span-2">
            {/* Секция избранного */}
            <section className="rounded-3xl border border-white/10 bg-[#13161C]/80 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-[#00FF87]" />
                    <h2 className="text-lg font-bold text-white">Сохранённые товары</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Товары, за динамикой цен и рейтингом которых ты следишь
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  {totalFavorites} {getNoun(totalFavorites, "товар", "товара", "товаров")}
                </span>
              </div>

              <DashboardFavoritesList
                initialFavorites={(favorites || []).map((item) => {
                  const rawP = Array.isArray(item.products) ? item.products[0] : item.products;
                  const fallback = rawP?.id ? getDemoProductById(rawP.id) : null;
                  const id = rawP?.id || item.product_id;
                  const demoP = fallback || getDemoProductById(id);
                  const name = rawP?.canonical_name || demoP?.canonical_name || "Товар каталога";
                  const brand = rawP?.brand || demoP?.brand || "Бренд";
                  const category = rawP?.category || demoP?.category || "Категория";
                  const img = rawP?.image_url || demoP?.image_url || null;
                  const offers = demoP?.product_offers ?? [];
                  const metrics = computeProductAiMetrics(
                    id,
                    category,
                    brand,
                    offers.map((o) => ({ price: o.price, rating: o.rating })),
                  );
                  const minPrice =
                    offers.length > 0
                      ? offers.reduce(
                          (min, cur) => (cur.price && cur.price < min ? cur.price : min),
                          offers[0]?.price ?? 0,
                        )
                      : null;

                  return {
                    productId: id,
                    createdAt: item.created_at,
                    name,
                    brand,
                    category,
                    imageUrl: img,
                    price: minPrice,
                    aiScore: metrics.aiScore,
                    antiFakePercent: metrics.antiFakePercent,
                  };
                })}
              />
            </section>

            {/* Секция истории просмотров */}
            <section className="rounded-3xl border border-white/10 bg-[#13161C]/80 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-5 w-5 text-[#00FF87]" />
                    <h2 className="text-lg font-bold text-white">История просмотров</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Недавно открытые карточки товаров с анализом маркетплейсов
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  {totalHistory}
                </span>
              </div>

              <DashboardHistoryList
                initialHistory={(history || []).map((item) => {
                  const rawP = Array.isArray(item.products) ? item.products[0] : item.products;
                  const id = rawP?.id || item.id;
                  const fallback = id ? getDemoProductById(id) : null;
                  const name = rawP?.canonical_name || fallback?.canonical_name || "Товар";
                  const brand = rawP?.brand || fallback?.brand || "Бренд";
                  const category = rawP?.category || fallback?.category || "Категория";
                  const img = rawP?.image_url || fallback?.image_url || null;

                  return {
                    id: item.id,
                    productId: id,
                    viewedAt: item.viewed_at,
                    name,
                    brand,
                    category,
                    imageUrl: img,
                  };
                })}
              />
            </section>
          </div>

          {/* Правая колонка (1/3): Сохранённые поиски и Умные подсказки */}
          <div className="space-y-8">
            {/* Сохранённые поисковые запросы */}
            <section className="rounded-3xl border border-white/10 bg-[#13161C]/80 p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-[#00FF87]" />
                    <h2 className="text-lg font-bold text-white">Сохранённые поиски</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Быстрый переход к твоим запросам</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-semibold text-slate-300">
                  {totalSearches}
                </span>
              </div>

              <DashboardSearchesList
                initialSearches={(searches || []).map((item) => ({
                  id: item.id,
                  query: item.query,
                  createdAt: item.created_at,
                }))}
              />
            </section>

            {/* Карточка AI-ассистента и рекомендаций */}
            <section className="relative overflow-hidden rounded-3xl border border-[#00FF87]/20 bg-gradient-to-b from-[#00FF87]/[0.08] to-[#13161C] p-6 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#00FF87]" />
                <h3 className="font-extrabold text-white">Рекомендации wobuy.</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Нейросеть мониторит 4 ключевых маркетплейса (Ozon, WB, Яндекс Маркет, Мегамаркет). Как только цена на сохранённый товар упадёт, мы подсветим лучшую сделку.
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs text-slate-300">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#00FF87]" />
                  <span>Анти-Фейк проверка включена</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs text-slate-300">
                  <TrendingUp className="h-4 w-4 shrink-0 text-[#00FF87]" />
                  <span>Анализ динамики цен активен</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Настройки аккаунта и безопасности */}
        <section className="mt-10 rounded-3xl border border-white/10 bg-[#13161C]/80 p-6 backdrop-blur-xl md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00FF87]/10 text-[#00FF87]">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Управление профилем и безопасность</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Персонализация, контактный email и параметры доступа
              </p>
            </div>
          </div>
          <ProfileSettings initialName={displayName} email={user.email ?? ""} />
        </section>
      </div>

      <MobileBottomNav />
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  subtext: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#171A21]/90 p-4 transition-all duration-300 hover:border-[#00FF87]/30 hover:bg-[#1A1E26]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-400">{label}</span>
        <span>{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-[10px] text-slate-500">{subtext}</div>
    </div>
  );
}

function getNoun(number: number, one: string, two: string, five: string) {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) {
    return five;
  }
  n %= 10;
  if (n === 1) {
    return one;
  }
  if (n >= 2 && n <= 4) {
    return two;
  }
  return five;
}

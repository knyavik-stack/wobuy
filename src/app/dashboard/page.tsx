import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Bookmark, Clock3, Heart, Search, Settings, Sparkles, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/auth-form";
import ProfileSettings from "@/components/dashboard/profile-settings";
import { deleteHistoryItem, deleteSavedSearch } from "./actions";

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
    typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "";

  return (
    <main className="min-h-screen bg-[#0D0F14] px-4 py-6 text-slate-100 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              wobuy<span className="text-[#00FF87]">.</span>
            </Link>
            <p className="mt-3 text-xs text-slate-500">Личный кабинет · демо-режим</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">
              {displayName ? `Привет, ${displayName}` : "Твоя рабочая область"}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Сохраняй товары и поиски, возвращайся к просмотрам и проверяй демо-аналитику.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Найти товар
            </Link>
            <LogoutButton />
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat icon={<Heart />} label="Сохранено товаров" value={favorites?.length ?? 0} />
          <Stat icon={<Bookmark />} label="Сохранено поисков" value={searches?.length ?? 0} />
          <Stat icon={<Clock3 />} label="Просмотров" value={history?.length ?? 0} />
          <Stat icon={<Sparkles />} label="Режим" value="ДЕМО" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-white/10 bg-[#13161C]/70 p-5 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Сохранённые товары</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Избранное с привязкой к твоему аккаунту.
                </p>
              </div>
              <Heart className="h-5 w-5 text-[#00FF87]" />
            </div>
            {favorites?.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {favorites.map((item) => {
                  const p = Array.isArray(item.products) ? item.products[0] : item.products;
                  return p ? (
                    <Link
                      key={item.product_id}
                      href={`/product/${p.id}`}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#00FF87]/30"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#00FF87]">
                        {p.brand}
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm font-bold text-white">
                        {p.canonical_name}
                      </div>
                      <div className="mt-2 text-xs text-slate-500">{p.category}</div>
                    </Link>
                  ) : null;
                })}
              </div>
            ) : (
              <Empty text="Пока нет сохранённых товаров. Открой товар и добавь его в избранное." />
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#13161C]/70 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Сохранённые поиски</h2>
                <p className="mt-1 text-xs text-slate-500">Быстрый возврат к запросам.</p>
              </div>
              <Search className="h-5 w-5 text-[#00FF87]" />
            </div>
            {searches?.length ? (
              <div className="space-y-2">
                {searches.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <Link
                      href={`/search?q=${encodeURIComponent(item.query)}`}
                      className="min-w-0 flex-1 truncate text-sm font-semibold text-white hover:text-[#00FF87]"
                    >
                      {item.query}
                    </Link>
                    <form action={deleteSavedSearch.bind(null, item.id)}>
                      <button
                        type="submit"
                        aria-label="Удалить поиск"
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="Сохраняй интересные запросы из выдачи." />
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#13161C]/70 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">История просмотров</h2>
              <p className="mt-1 text-xs text-slate-500">Последние товары, которые ты открывал.</p>
            </div>
            <Clock3 className="h-5 w-5 text-[#00FF87]" />
          </div>
          {history?.length ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {history.map((item) => {
                const p = Array.isArray(item.products) ? item.products[0] : item.products;
                return p ? (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <Link href={`/product/${p.id}`} className="block">
                      <div className="text-[10px] font-bold uppercase text-[#00FF87]">
                        {p.brand}
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm font-bold text-white hover:text-[#00FF87]">
                        {p.canonical_name}
                      </div>
                    </Link>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.viewed_at).toLocaleDateString("ru-RU")}
                      </span>
                      <form action={deleteHistoryItem.bind(null, item.id)}>
                        <button
                          type="submit"
                          aria-label="Удалить просмотр"
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <Empty text="История появится после открытия карточек товаров." />
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#13161C]/70 p-5">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-[#00FF87]" />
            <div>
              <h2 className="font-bold text-white">Настройки аккаунта</h2>
              <p className="mt-1 text-xs text-slate-500">Профиль, email и безопасность.</p>
            </div>
          </div>
          <ProfileSettings initialName={displayName} email={user.email ?? ""} />
        </section>
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#13161C]/70 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-[#00FF87]">{icon}</span>
      </div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs leading-relaxed text-slate-500">
      {text}
    </div>
  );
}

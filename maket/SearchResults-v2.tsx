import Link from "next/link";
import { Search, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import type { SearchProduct } from "@/lib/catalog/search";

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "Цена не указана";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function SearchResults({
  query,
  products,
}: {
  query: string;
  products: SearchProduct[];
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0D0F14] p-4 font-sans text-slate-100 selection:bg-[#00FF87] selection:text-black md:p-8">
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]" />

      <header className="relative z-10 mx-auto mb-8 flex max-w-7xl flex-col justify-between gap-4 border-b border-white/5 pb-6 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              wobuy<span className="text-[#00FF87]">.</span>
            </Link>
            <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
              ИИ-Результаты
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Запрос:</span>
            <span className="rounded bg-white/5 px-2 py-1 font-medium text-slate-200">
              «{query || "все товары"}»
            </span>
          </div>
        </div>

        <form action="/search" className="relative w-full md:w-96">
          <input
            name="q"
            defaultValue={query}
            placeholder="Что ищем?"
            className="w-full rounded-xl border border-white/10 bg-[#13161C] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/30"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        </form>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between px-1 text-xs text-slate-400">
          <span>
            Найдено товаров: <strong className="text-white">{products.length}</strong>
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00FF87]" />
            Только активные данные каталога
          </span>
        </div>

        {products.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-[#13161C]/50 p-8 text-center backdrop-blur-xl md:p-14">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#00FF87]/20 bg-[#00FF87]/10">
              <Sparkles className="h-5 w-5 text-[#00FF87]" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">
              Пока нет товаров для этой выдачи
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              Каталог подключён к реальным данным Supabase. Когда сборщики загрузят товары и
              предложения маркетплейсов, они появятся здесь автоматически.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Мы специально не показываем демонстрационные товары вместо реальных данных.
            </p>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const offer = [...product.offers].sort(
                (a, b) =>
                  (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER),
              )[0];

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#13161C]/50 backdrop-blur-md transition-colors hover:border-white/20"
                >
                  <div className="flex h-48 items-center justify-center bg-[#0A0C11]">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Sparkles className="h-8 w-8 text-slate-700" />
                    )}
                  </div>
                  <div className="space-y-4 p-5">
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#00FF87]">
                        {product.brand}
                      </div>
                      <h2 className="line-clamp-2 text-base font-bold text-white">
                        {product.title}
                      </h2>
                      {product.category ? (
                        <p className="mt-1 text-xs text-slate-500">{product.category}</p>
                      ) : null}
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="text-xl font-extrabold text-white">
                          {formatPrice(offer?.price ?? null, offer?.currency ?? "RUB")}
                        </div>
                        {offer?.marketplace ? (
                          <div className="mt-1 text-[10px] font-semibold text-slate-500">
                            {offer.marketplace}
                          </div>
                        ) : null}
                      </div>
                      {offer?.rating !== null && offer?.rating !== undefined ? (
                        <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold text-slate-200">
                          ★ {offer.rating.toFixed(1)}
                        </div>
                      ) : null}
                    </div>

                    {offer?.url ? (
                      <a
                        href={offer.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00FF87] py-3 text-xs font-extrabold text-black transition-colors hover:bg-[#00E576]"
                      >
                        Открыть предложение
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

import Link from "next/link";
import { BarChart3, Bookmark, ExternalLink, List, Search, ShieldCheck, Sparkles, Truck, Grid3X3, SlidersHorizontal } from "lucide-react";
import { saveSearch } from "@/app/dashboard/actions";
import type { SearchProduct } from "@/lib/catalog/search";

function price(value: number | null, currency = "RUB") {
  if (value == null) return "Цена не указана";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function href(query: string, category: string, sort: string, view: string) {
  const p = new URLSearchParams();
  if (query) p.set("q", query);
  if (category !== "all") p.set("category", category);
  if (sort !== "relevance") p.set("sort", sort);
  if (view !== "grid") p.set("view", view);
  return `/search?${p.toString()}`;
}

export default async function SearchResults({ query, products, categories, category, sort, view }: { query: string; products: SearchProduct[]; categories: string[]; category: string; sort: string; view: "grid" | "list" }) {
  const offers = products.flatMap((p) => p.offers);
  const prices = offers.map((o) => o.price).filter((v): v is number => v != null);
  const ratings = offers.map((o) => o.rating).filter((v): v is number => v != null);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const min = prices.length ? Math.min(...prices) : null;
  const max = prices.length ? Math.max(...prices) : null;
  const filterBase = "rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.07]";

  return <div className="min-h-screen w-full overflow-x-hidden bg-[#0D0F14] px-4 py-5 font-sans text-slate-100 md:px-8 md:py-7">
    <div className="pointer-events-none fixed right-0 top-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-[120px]" />
    <header className="relative z-10 mx-auto mb-5 flex max-w-7xl flex-col gap-4 border-b border-white/5 pb-5 md:flex-row md:items-center md:justify-between">
      <div><div className="mb-1.5 flex items-center gap-2"><Link href="/" className="text-xl font-bold text-white">wobuy<span className="text-[#00FF87]">.</span></Link><span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Демо-каталог</span></div><div className="text-xs text-slate-500">Запрос: <span className="text-slate-300">«{query || "все товары"}»</span></div></div>
      <form action="/search" className="relative w-full md:w-[420px]"><Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" /><input name="q" defaultValue={query} placeholder="Что ищем?" className="w-full rounded-xl border border-white/10 bg-[#13161C] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-[#00FF87]/50" /></form>
    </header>
    <main className="relative z-10 mx-auto max-w-7xl">
      <section className="mb-4 grid gap-2 md:grid-cols-4"><Metric label="Товаров" value={`${products.length}`} /><Metric label="Предложений" value={`${offers.length}`} /><Metric label="Средний рейтинг" value={avg ? avg.toFixed(1) : "—"} /><Metric label="Цены" value={min != null ? `${price(min)} — ${price(max)}` : "—"} /></section>
      <section className="mb-4 rounded-2xl border border-white/10 bg-[#13161C]/80 p-3 md:p-4"><div className="mb-3 flex items-center gap-2 text-sm font-bold"><SlidersHorizontal className="h-4 w-4 text-[#00FF87]" />Фильтры и сортировка</div><div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">Категория</span><Link href={href(query,"all",sort,view)} className={`${filterBase} ${category === "all" ? "border-[#00FF87]/30 bg-[#00FF87]/10 text-[#00FF87]" : ""}`}>Все</Link>{categories.map((c) => <Link key={c} href={href(query,c,sort,view)} className={`${filterBase} ${category === c ? "border-[#00FF87]/30 bg-[#00FF87]/10 text-[#00FF87]" : ""}`}>{c}</Link>)}<span className="mx-1 hidden h-6 w-px bg-white/10 md:block" /><span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">Сортировка</span>{[["relevance","По названию"],["price_asc","Дешевле"],["price_desc","Дороже"],["rating","Рейтинг"]].map(([s,label]) => <Link key={s} href={href(query,category,s,view)} className={`${filterBase} ${sort === s ? "bg-white/10 text-white" : ""}`}>{label}</Link>)}</div></section>
      <div className="mb-4 flex items-center justify-between"><div className="text-xs text-slate-500">Найдено <strong className="text-white">{products.length}</strong> товаров</div><div className="flex items-center gap-2"><form action={saveSearch.bind(null, query)}><button type="submit" disabled={!query} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.08] disabled:opacity-40"><Bookmark className="h-3.5 w-3.5" />Сохранить</button></form><div className="flex rounded-xl border border-white/10 bg-[#13161C] p-1"><Link aria-label="Карточки" href={href(query,category,sort,"grid")} className={`rounded-lg p-2 ${view === "grid" ? "bg-white/10 text-[#00FF87]" : "text-slate-500"}`}><Grid3X3 className="h-4 w-4" /></Link><Link aria-label="Список" href={href(query,category,sort,"list")} className={`rounded-lg p-2 ${view === "list" ? "bg-white/10 text-[#00FF87]" : "text-slate-500"}`}><List className="h-4 w-4" /></Link></div></div></div>
      {products.length === 0 ? <section className="rounded-2xl border border-white/10 bg-[#13161C] p-12 text-center"><Sparkles className="mx-auto mb-4 h-7 w-7 text-[#00FF87]" /><h1 className="text-xl font-extrabold text-white">Ничего не найдено</h1><p className="mt-2 text-sm text-slate-500">Измени запрос или фильтр.</p></section> : <div className={view === "grid" ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>{products.map((product) => { const offer = [...product.offers].sort((a,b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER))[0]; return <article key={product.id} className={`overflow-hidden rounded-2xl border border-white/10 bg-[#13161C]/70 transition hover:border-white/20 ${view === "list" ? "flex flex-col md:flex-row" : ""}`}><Link href={`/product/${product.id}`} className={view === "list" ? "h-48 shrink-0 md:h-auto md:w-56" : "block"}><div className={`flex items-center justify-center bg-[#0A0C11] ${view === "list" ? "h-48 md:h-full" : "h-48"}`}>{product.imageUrl ? <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" /> : <Sparkles className="h-8 w-8 text-slate-700" />}</div></Link><div className={`flex flex-1 flex-col gap-3 p-5 ${view === "list" ? "md:justify-center" : ""}`}><Link href={`/product/${product.id}`}><div className="text-[10px] font-bold uppercase tracking-wider text-[#00FF87]">{product.brand}</div><h2 className="mt-1 line-clamp-2 text-base font-bold text-white hover:text-[#00FF87]">{product.title}</h2><p className="mt-1 text-xs text-slate-500">{product.category}</p></Link><div className="flex items-end justify-between gap-3"><div><div className="text-xl font-extrabold text-white">{price(offer?.price ?? null, offer?.currency ?? "RUB")}</div><div className="mt-1 text-[10px] font-semibold text-slate-500">{offer?.marketplace ?? ""}</div></div>{offer?.rating != null && <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold">★ {Number(offer.rating).toFixed(1)}</div>}</div>{offer?.deliveryText && <div className="flex items-center gap-2 text-xs text-slate-500"><Truck className="h-3.5 w-3.5" />{offer.deliveryText}</div>}<div className="mt-auto flex gap-2"><Link href={`/product/${product.id}`} className="flex flex-1 items-center justify-center rounded-xl bg-white/5 py-3 text-xs font-extrabold text-white hover:bg-white/10">Подробнее</Link>{offer?.url && <a href={offer.url} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#00FF87] py-3 text-xs font-extrabold text-black hover:bg-[#00E576]">Открыть <ExternalLink className="h-3.5 w-3.5" /></a>}</div></div></article>; })}</div>}
    </main>
  </div>;
}
function Metric({label,value}:{label:string;value:string}) { return <div className="rounded-xl border border-white/10 bg-[#13161C]/70 p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{label}</div><div className="mt-1 truncate text-sm font-black text-white">{value}</div></div>; }

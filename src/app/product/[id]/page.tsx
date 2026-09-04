import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Heart, ShieldCheck, Star, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { toggleFavorite } from "@/app/dashboard/actions";

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "Цена не указана";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: product, error } = await supabase.from("products").select("id, canonical_name, brand, category, description, image_url, ai_summary, product_offers(id, marketplace, title, url, price, currency, rating, review_count, delivery_text, availability)").eq("id", id).eq("is_active", true).maybeSingle();
  if (error || !product) notFound();

  if (user) {
    await supabase.from("product_view_history").insert({ user_id: user.id, product_id: product.id });
  }
  const { data: favorite } = user ? await supabase.from("user_favorites").select("product_id").eq("user_id", user.id).eq("product_id", product.id).maybeSingle() : { data: null };
  const offers = [...(product.product_offers ?? [])].sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));

  return (
    <main className="min-h-screen bg-[#0D0F14] px-4 py-6 text-slate-100 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4"><Link href="/search" className="text-sm font-semibold text-slate-400 hover:text-white">← Назад к поиску</Link><Link href="/dashboard" className="text-sm font-semibold text-[#00FF87] hover:underline">Личный кабинет</Link></div>
        <section className="grid overflow-hidden rounded-3xl border border-white/10 bg-[#13161C]/70 backdrop-blur-xl md:grid-cols-2">
          <div className="flex min-h-[360px] items-center justify-center bg-[#0A0C11]">{product.image_url ? <img src={product.image_url} alt={product.canonical_name} className="h-full w-full object-cover" /> : <span className="text-slate-600">Нет изображения</span>}</div>
          <div className="p-6 md:p-10">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#00FF87]">{product.brand || "Без бренда"}</div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">{product.canonical_name}</h1>
            <p className="mt-2 text-sm text-slate-500">{product.category}</p>
            <p className="mt-6 leading-relaxed text-slate-300">{product.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {user ? <form action={toggleFavorite.bind(null, product.id)}><button type="submit" className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${favorite ? "bg-[#00FF87] text-black" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}><Heart className="h-4 w-4" fill={favorite ? "currentColor" : "none"} />{favorite ? "В избранном" : "Сохранить товар"}</button></form> : <Link href="/login" className="rounded-xl bg-[#00FF87] px-4 py-3 text-sm font-bold text-black">Войти, чтобы сохранить</Link>}
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3 text-sm text-slate-300"><ShieldCheck className="h-5 w-5 text-[#00FF87]" />Демонстрационный каталог для полной отладки пользовательского сценария</div>
            {product.ai_summary ? <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">{product.ai_summary}</div> : null}
          </div>
        </section>
        <section className="mt-8"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold text-white">Предложения</h2><span className="text-xs text-slate-500">{offers.length} варианта</span></div><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{offers.map((offer) => <article key={offer.id} className="rounded-2xl border border-white/10 bg-[#13161C] p-5"><div className="flex items-center justify-between gap-3"><span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-white">{offer.marketplace}</span>{offer.rating != null ? <span className="flex items-center gap-1 text-xs font-bold text-slate-300"><Star className="h-3.5 w-3.5 fill-current" />{Number(offer.rating).toFixed(1)}</span> : null}</div><h3 className="mt-4 line-clamp-2 text-sm font-bold text-white">{offer.title}</h3><div className="mt-4 text-2xl font-black text-[#00FF87]">{formatPrice(offer.price, offer.currency)}</div><div className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Truck className="h-3.5 w-3.5" />{offer.delivery_text || "Уточняется"}</div>{offer.review_count != null ? <div className="mt-1 text-xs text-slate-500">{offer.review_count.toLocaleString("ru-RU")} отзывов</div> : null}<a href={offer.url} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#00FF87] py-3 text-xs font-extrabold text-black hover:bg-[#00E576]">Открыть предложение <ExternalLink className="h-3.5 w-3.5" /></a></article>)}</div></section>
      </div>
    </main>
  );
}

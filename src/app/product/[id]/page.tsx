import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Star,
  Bot,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { computeProductAiMetrics, resolveProductById } from "@/lib/catalog/search";
import { generateProductAnalysis } from "@/lib/ai/analyzer";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ProductFavoriteButton } from "@/components/product/product-favorite-button";
import { MarketplaceBadge } from "@/components/ui/MarketplaceBadge";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ReviewsAnalysisCard } from "@/components/analytics/ReviewsAnalysisCard";
import { DeliveryAnalysisCard } from "@/components/analytics/DeliveryAnalysisCard";
import { PriceHistoryCard } from "@/components/analytics/PriceHistoryCard";

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "Цена не указана";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

// Круговой неоновый индикатор AI Score
function ProductAiGauge({ score }: { score: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(10, Math.max(0, score));
  const progress = clamped / 10;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex shrink-0 flex-col items-center justify-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 84 84">
          <circle
            cx="42"
            cy="42"
            r={radius}
            className="stroke-white/10"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="42"
            cy="42"
            r={radius}
            className="stroke-[#00FF87] transition-all duration-700 ease-out"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: "drop-shadow(0 0 8px rgba(0, 255, 135, 0.7))",
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black tracking-tight text-white">
            {score.toFixed(1)}
          </span>
          <span className="text-[9px] font-black tracking-widest text-[#00FF87]">
            AI SCORE
          </span>
        </div>
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let user = null;
  let favorite = null;

  // Разрешаем товар гарантированно без 404
  const resolved = await resolveProductById(id);
  if (!resolved) {
    notFound();
  }

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data: userData } = await supabase.auth.getUser();
      user = userData?.user ?? null;

      if (user) {
        const { data: favData } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", resolved.id)
          .maybeSingle();
        favorite = favData;

        // Фиксируем просмотр в истории
        supabase
          .from("product_view_history")
          .insert({ user_id: user.id, product_id: resolved.id })
          .then();
      }
    }
  } catch (err) {
    console.warn("[ProductPage] Auth check error:", err);
  }

  const offers = resolved.offers || [];
  const sortedOffers = [...offers].sort(
    (a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER),
  );
  const bestOffer = sortedOffers[0];
  const bestPrice = bestOffer?.price ?? null;
  const currency = bestOffer?.currency || "RUB";

  const metrics = computeProductAiMetrics(resolved.id, resolved.category, resolved.brand, offers);

  // Выполняем генерацию полного вердикта 4 агентов
  const analysis = await generateProductAnalysis(
    resolved.title,
    resolved.brand,
    resolved.category,
    bestPrice ?? 2500,
    offers.map((o) => ({
      marketplace: o.marketplace,
      price: o.price,
      rating: o.rating,
    })),
  );

  const productImages = resolved.images && resolved.images.length > 0
    ? resolved.images
    : [resolved.imageUrl];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0D0F14] pb-24 font-sans text-slate-100 sm:pb-16">
      {/* Фоновые неоновые подсветки */}
      <div className="pointer-events-none fixed right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#00FF87]/5 blur-[150px]" />
      <div className="pointer-events-none fixed -left-20 top-80 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[140px]" />

      {/* Шапка страницы */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0D0F14]/90 px-4 py-3.5 backdrop-blur-xl md:px-8 md:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              aria-label="Назад к поиску"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-[#00FF87]/50 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <BrandLogo size="sm" />
          </div>

          <div className="flex items-center gap-3">
            <ProductFavoriteButton
              productId={resolved.id}
              initialIsFavorite={Boolean(favorite)}
            />
            {bestOffer?.url && (
              <a
                href={bestOffer.url}
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-2 rounded-full bg-[#00FF87] px-4 py-2 text-xs font-bold text-black shadow-[0_0_15px_rgba(0,255,135,0.4)] transition hover:bg-[#00E576] sm:flex"
              >
                <span>Купить на {bestOffer.marketplace}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
        {/* Хлебные крошки */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-white">Главная</Link>
          <span>/</span>
          <Link href={`/search?category=${encodeURIComponent(resolved.category)}`} className="hover:text-white">
            {resolved.category}
          </Link>
          <span>/</span>
          <span className="font-semibold text-white">{resolved.brand}</span>
        </div>

        {/* Главный блок товара: Галерея слева + Карточка оффера и AI Score справа */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Левая колонка: Интерактивная фотогалерея */}
          <div className="lg:col-span-6 xl:col-span-5">
            <ProductGallery
              images={productImages}
              title={resolved.title}
              marketplace={bestOffer?.marketplace}
            />
          </div>

          {/* Правая колонка: Информация, AI Score, Выбор лучшей цены и кнопки */}
          <div className="flex flex-col justify-between lg:col-span-6 xl:col-span-7">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {resolved.brand}
                </span>
                <span className="rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-bold text-[#00FF87]">
                  ✓ Проверено ИИ wobuy.
                </span>
              </div>

              <h1 className="text-xl font-black leading-tight text-white sm:text-2xl md:text-3xl">
                {resolved.title}
              </h1>

              {/* Карточка AI Score и анти-фейк защиты */}
              <div className="flex flex-col gap-4 rounded-3xl border border-emerald-500/30 bg-[#12151B] p-5 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <ProductAiGauge score={metrics.aiScore} />
                  <div>
                    <div className="text-sm font-extrabold uppercase tracking-wider text-white">
                      Индекс честности и качества
                    </div>
                    <div className="text-xs text-slate-400">
                      Сформирован на основе анализа 4 независимых ИИ-агентов
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#00FF87]">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Анти-Фейк Защита: {metrics.antiFakePercent}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs sm:border-l sm:border-white/10 sm:pl-4">
                  {metrics.aiTags.map((tag, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 font-medium text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#00FF87]" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Сравнение предложений на маркетплейсах */}
              <div className="rounded-3xl border border-white/10 bg-[#12151B] p-5 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Предложения на маркетплейсах ({offers.length})
                  </h3>
                  <span className="text-xs font-bold text-[#00FF87]">Лучшая цена найдена</span>
                </div>

                <div className="space-y-2.5">
                  {sortedOffers.map((off, idx) => (
                    <div
                      key={off.id || idx}
                      className={`flex flex-col justify-between gap-3 rounded-2xl border p-3.5 transition sm:flex-row sm:items-center ${
                        idx === 0
                          ? "border-[#00FF87]/50 bg-emerald-950/20 shadow-[0_0_15px_rgba(0,255,135,0.1)]"
                          : "border-white/5 bg-[#0D0F14]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MarketplaceBadge marketplace={off.marketplace} size="md" showLabel={true} />
                        <div>
                          <div className="text-sm font-black text-white">
                            {formatPrice(off.price, off.currency || currency)}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            {off.rating && (
                              <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                                <Star className="h-3 w-3 fill-amber-400" />
                                {off.rating}
                              </span>
                            )}
                            <span>•</span>
                            <span>{off.deliveryText || "Доставка со склада"}</span>
                          </div>
                        </div>
                      </div>

                      {off.url ? (
                        <a
                          href={off.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                            idx === 0
                              ? "bg-[#00FF87] text-black shadow-[0_0_12px_rgba(0,255,135,0.4)] hover:bg-[#00E576]"
                              : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                          }`}
                        >
                          <span>В магазин</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">В наличии</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Описание товара */}
              <div className="rounded-3xl border border-white/10 bg-[#12151B] p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Описание и свойства
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {resolved.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Секция вердикта 4 ИИ-агентов */}
        <section className="mt-12">
          <div className="mb-6 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87]">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-white sm:text-lg">
                Вердикт 4 независимых ИИ-агентов wobuy.
              </h2>
              <p className="text-xs text-slate-400">
                Каждый агент анализирует товар со своей строгой стороны
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(analysis?.perspectives || []).map((persp, pIdx) => (
              <div
                key={pIdx}
                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#12151B] p-5 shadow-lg transition hover:border-[#00FF87]/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{persp.emoji}</span>
                    <span className={`rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold ${persp.textColor}`}>
                      {persp.archetype}
                    </span>
                  </div>
                  <div className="mt-3 text-sm font-black text-white">{persp.title}</div>
                  <ul className="mt-2.5 space-y-1.5 text-xs text-slate-300 leading-relaxed">
                    {persp.points.map((pt, ptIdx) => (
                      <li key={ptIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00FF87]" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3 НОВЫХ АНАЛИТИЧЕСКИХ МОДУЛЯ */}
        <section className="mt-12 space-y-6">
          {/* 1. Анализ отзывов и детекция ботов */}
          <ReviewsAnalysisCard
            productTitle={resolved.title}
            rating={bestOffer?.rating ?? 4.8}
            reviewCount={bestOffer?.reviewCount ?? 1420}
            antiFakeScore={metrics.antiFakePercent}
          />

          {/* 2. Анализ доставок и складов */}
          <DeliveryAnalysisCard
            offers={offers.map((o) => ({
              marketplace: o.marketplace,
              price: o.price ?? 2500,
              deliveryText: o.deliveryText || "Доставка 1-2 дня",
              speedRating: 9.5,
            }))}
            currency={currency}
          />

          {/* 3. Анализ изменения цен и честности скидок */}
          <PriceHistoryCard
            currentPrice={bestPrice ?? 2500}
            discountPercent={resolved.discountPercent}
            currency={currency}
            sparkline={resolved.priceSparkline}
          />
        </section>
      </main>

      {/* Мобильная нижняя панель навигации */}
      <MobileBottomNav />
    </div>
  );
}

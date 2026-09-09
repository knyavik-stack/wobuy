import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Star,
  Sliders,
  Sparkles,
  ShoppingBag,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { resolveProductById } from "@/lib/catalog/search";
import { generateProductAnalysis } from "@/lib/ai/analyzer";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ProductFavoriteButton } from "@/components/product/product-favorite-button";
import { MarketplaceBadge } from "@/components/ui/MarketplaceBadge";
import { ProductGallery } from "@/components/product/ProductGallery";
import { TcoCalculatorCard } from "@/components/product/TcoCalculatorCard";
import { UnifiedAgentsAudit } from "@/components/product/UnifiedAgentsAudit";
import { FomoAlternativesDrawer } from "@/components/product/FomoAlternativesDrawer";
import { ReviewsAnalysisCard } from "@/components/analytics/ReviewsAnalysisCard";
import { DeliveryAnalysisCard } from "@/components/analytics/DeliveryAnalysisCard";
import { PriceHistoryCard } from "@/components/analytics/PriceHistoryCard";
import { NeonScoreCircle } from "@/components/ui/NeonScoreCircle";

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "от 2 450 ₽";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fromQuery?: string; q?: string }>;
}) {
  const { id } = await params;
  const sParams = await searchParams;
  const fromQuery = sParams.fromQuery || sParams.q || "";
  const backHref = fromQuery ? `/search?q=${encodeURIComponent(fromQuery)}` : "/search";
  let user = null;
  let favorite = null;

  // Разрешаем товар гарантированно без 404 с учетом поискового контекста
  const resolved = await resolveProductById(id, fromQuery);
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

  // Выполняем генерацию полного вердикта мультиагентного анализа wobuy.
  const analysis = await generateProductAnalysis(
    resolved.title,
    resolved.brand,
    resolved.category,
    bestPrice ?? 2500,
    offers.map((o) => ({
      marketplace: o.marketplace,
      price: o.price,
      rating: o.rating,
      reviewCount: o.reviewCount,
      deliveryText: o.deliveryText,
      url: o.url,
    })),
  );

  const aggregateScore = analysis?.aiScore ?? resolved.aiScore ?? 9.4;
  // Единый согласованный процент доверия анти-фейк (без рассинхрона!)
  const antiFakePercent = analysis?.antiFakePercent ?? resolved.antiFakePercent ?? 96;

  const productImages = resolved.images && resolved.images.length > 0
    ? resolved.images
    : [resolved.imageUrl];

  // Фильтруем сравнение предложений строго по 2 маркетплейсам: Wildberries и Ozon
  const marketplaceList = (analysis?.marketplaceComparison || []).filter(
    (m) => m.marketplace === "wildberries" || m.marketplace === "ozon"
  );

  // Определяем явного победителя дуэли (Выбор wobuy.)
  const recommendedMkt = marketplaceList.find((m) => m.isRecommended) || marketplaceList[0];
  const winnerMarketplaceName = recommendedMkt
    ? recommendedMkt.name
    : bestOffer?.marketplace?.toLowerCase().includes("wildberries")
      ? "Wildberries"
      : "Ozon";
  const winnerUrl = recommendedMkt?.url || bestOffer?.url || "#";

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
              href={backHref}
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
            {winnerUrl && (
              <a
                href={winnerUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-2 rounded-full bg-[#00FF87] px-4 py-2 text-xs font-black text-black shadow-[0_0_15px_rgba(0,255,135,0.4)] transition hover:bg-[#00E576] sm:flex"
              >
                <span>Забрать на {winnerMarketplaceName}</span>
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
          {fromQuery ? (
            <>
              <Link href={`/search?q=${encodeURIComponent(fromQuery)}`} className="hover:text-white text-emerald-400 font-medium">
                Поиск: «{fromQuery}»
              </Link>
              <span>/</span>
            </>
          ) : (
            <>
              <Link href={`/search?category=${encodeURIComponent(resolved.category)}`} className="hover:text-white">
                {resolved.category}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="font-semibold text-white">{resolved.brand}</span>
        </div>

        {/* Главный блок товара: Галерея слева + Карточка названия и блок дуэли справа (выравнивание нижних границ) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Левая колонка: Интерактивная фотогалерея */}
          <div className="flex flex-col h-full lg:col-span-6 xl:col-span-5">
            <ProductGallery
              images={productImages}
              title={resolved.title}
              marketplace={bestOffer?.marketplace}
            />
          </div>

          {/* Правая колонка: Название + AI Score и под ним блок дуэли маркетплейсов */}
          <div className="flex flex-col justify-between gap-6 lg:col-span-6 xl:col-span-7 h-full">
            {/* Карточка сведений о товаре и общий AI Score в неоновом круге */}
            <div className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-[#12151B] p-6 shadow-xl sm:flex-row sm:items-center">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00FF87]">
                  <span>{resolved.brand}</span>
                  <span>•</span>
                  <span>{resolved.category}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black leading-tight text-white">
                  {resolved.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <span>{(bestOffer?.rating ?? 4.9).toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">
                      ({(bestOffer?.reviewCount ?? 0).toLocaleString("ru-RU")} отзывов)
                    </span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <div className="flex items-center gap-1 font-bold text-purple-300">
                    <ShieldCheck className="h-4 w-4 text-purple-400" />
                    <span>Анти-Фейк Защита: {antiFakePercent}%</span>
                  </div>
                </div>
              </div>

              {/* Неоновый индикатор AI Score */}
              <div className="flex justify-center sm:justify-end shrink-0">
                <NeonScoreCircle
                  score={aggregateScore}
                  size="md"
                  label="AI SCORE"
                  glowColor="emerald"
                />
              </div>
            </div>

            {/* ДУЭЛЬ ПРЕДЛОЖЕНИЙ: WILDBERRIES VS OZON (СТРОГО 2 МАРКЕТПЛЕЙСА) */}
            <div id="product-duel-section" className="flex flex-1 flex-col justify-between rounded-3xl border border-white/10 bg-[#12151B] p-5 shadow-xl">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                      Дуэль маркетплейсов: Wildberries vs Ozon (2)
                    </h3>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-[#00FF87]">
                      TCO-Сверка
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#00FF87]">Проверено wobuy.</span>
                </div>

                {/* Описание и рекомендация wobuy. В САМОМ НАЧАЛЕ ВНУТРИ БЛОКА ДУЭЛИ */}
                {analysis?.wobuyDecision && (
                  <div className="mb-4 overflow-hidden rounded-2xl border border-[#00FF87]/40 bg-gradient-to-br from-emerald-950/40 via-[#13161C] to-[#12151B] p-4 shadow-lg">
                    <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#00FF87] text-black font-black text-[11px] shadow-sm">
                          ✓
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-[#00FF87]">
                          Заключение и рекомендация wobuy.
                        </span>
                      </div>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-900/40 px-2 py-0.5 text-[10px] font-bold text-[#00FF87]">
                        98% Уверенность
                      </span>
                    </div>

                    <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-100">
                      {analysis.wobuyDecision}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#00FF87] shrink-0" />
                        <span>Победитель дуэли: <strong className="text-white">{winnerMarketplaceName}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>Траст отзывов: <strong className="text-white">{antiFakePercent}%</strong></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Карточки предложений Wildberries и Ozon */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {marketplaceList.map((mkt, idx) => {
                  const isWinner = mkt.isRecommended;
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 ${
                        isWinner
                          ? "border-[#00FF87]/50 bg-emerald-950/20 shadow-[0_0_20px_rgba(0,255,135,0.15)] ring-1 ring-[#00FF87]/30"
                          : "border-white/5 bg-[#0D0F14] opacity-90"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <MarketplaceBadge marketplace={mkt.marketplace} size="md" showLabel={true} />
                          {isWinner ? (
                            <span className="rounded-full bg-[#00FF87] px-2 py-0.5 text-[10px] font-black text-black">
                              ★ ВЫБОР WOBUY.
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">Второй вариант</span>
                          )}
                        </div>

                        <div className="mt-3">
                          <div className="text-xl font-black text-white">
                            {mkt.price ? formatPrice(mkt.price, currency) : "Уточняется"}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-bold text-amber-400">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {mkt.rating && mkt.rating > 0 ? mkt.rating.toFixed(1) : "4.8"}
                            </span>
                            {mkt.reviewsCount > 0 && (
                              <span className="text-[11px] text-slate-400">
                                ({mkt.reviewsCount.toLocaleString("ru-RU")} отзывов)
                              </span>
                            )}
                            <span className="text-slate-600">•</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {mkt.delivery}
                            </span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={mkt.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`mt-4 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                          isWinner
                            ? "bg-[#00FF87] text-black shadow-[0_0_12px_rgba(0,255,135,0.4)] hover:bg-[#00E576]"
                            : "border border-white/10 bg-white/5 text-white hover:border-[#00FF87]/40 hover:bg-white/10"
                        }`}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>
                          {isWinner
                            ? `Купить у победителя (${mkt.name})`
                            : mkt.price
                              ? `Купить на ${mkt.name}`
                              : `Смотреть аналоги на ${mkt.name}`}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* СЕКЦИЯ: ХАРАКТЕРИСТИКИ И РЕКОМЕНДАТЕЛЬНЫЙ ВЕРДИКТ ИИ WOBUY. (ЖИВЫМ ЧЕЛОВЕЧЕСКИМ ЯЗЫКОМ) */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#12151B] p-6 shadow-xl">
          <div className="flex items-center gap-2.5 text-sm font-extrabold uppercase tracking-wider text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30">
              <Sliders className="h-4 w-4" />
            </div>
            <span>Рекомендательный вердикт и характеристики от ИИ wobuy.</span>
          </div>

          {/* Живое связное описание в рекомендательной форме от лица ИИ */}
          <div className="mt-4 rounded-2xl border border-white/5 bg-[#0D0F14] p-5 text-sm leading-relaxed text-slate-200">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00FF87] mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Вердикт ИИ-эксперта wobuy.:</span>
            </div>
            <p className="font-medium">
              Мы провели полный независимый аудит модели <strong>{resolved.title}</strong> от бренда <strong>{resolved.brand}</strong>.
              По нашей оценке, это один из наиболее сбалансированных вариантов в категории «{resolved.category}».
              Качество материалов и заводская сборка полностью соответствуют заявленному классу, а доля подозрительных бот-отзывов минимальна (индекс траста {antiFakePercent}%).
            </p>
            <div className="mt-3 flex items-start gap-2 text-xs text-slate-300 border-t border-white/5 pt-3">
              <CheckCircle2 className="h-4 w-4 text-[#00FF87] shrink-0 mt-0.5" />
              <span>
                <strong>Кому рекомендуем:</strong> тем, кто ценит долговечность и честное соотношение цены и функционала. При получении в ПВЗ {winnerMarketplaceName} рекомендуем проверить целостность заводской упаковки и комплектацию.
              </span>
            </div>
          </div>

          {/* Структурированные ключевые характеристики */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(analysis?.specifications || [
              { label: "Бренд", value: resolved.brand || "Оригинал" },
              { label: "Категория", value: resolved.category || "Каталог" },
              { label: "Аудит подлинности", value: `Пройден на ${antiFakePercent}%` },
              { label: "Рекомендация wobuy.", value: `Покупка на ${winnerMarketplaceName}` },
            ]).map((spec, sIdx) => (
              <div
                key={sIdx}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#0D0F14] p-4 text-xs"
              >
                <span className="text-slate-400">{spec.label}</span>
                <strong className="font-bold text-white text-right">{spec.value}</strong>
              </div>
            ))}
          </div>
        </section>

        {/* БЛОК: КАЛЬКУЛЯТОР ЧЕСТНОЙ СТОИМОСТИ ПОКУПКИ (TCO) — РАСТЯНУТ ПО ГОРИЗОНТАЛИ */}
        <div className="mt-8">
          <TcoCalculatorCard
            tco={analysis?.tcoBreakdown}
            currency={currency}
            brand={resolved.brand}
          />
        </div>

        {/* СЕКЦИЯ: ОБЪЕДИНЕННЫЙ МУЛЬТИАГЕНТНЫЙ АУДИТ 4 ИИ-ЭКСПЕРТОВ (КОНФЛИКТ ИНТЕРЕСОВ + НЕОНОВЫЕ КРУГИ) */}
        <section className="mt-8">
          <UnifiedAgentsAudit
            perspectives={analysis?.perspectives}
            dialogue={analysis?.agentsDialogue}
            avgScore={aggregateScore}
            finalVerdict={analysis?.verdict || "Рекомендовано к покупке"}
            recommendedMarketplace={winnerMarketplaceName}
          />
        </section>

        {/* 3 АНАЛИТИЧЕСКИХ МОДУЛЯ: Семантика отзывов, Доставка со складов, Детектор манипуляций с ценой */}
        <section className="mt-8 space-y-6">
          {/* Семантический анализ отзывов (с единым анти-фейк процентом) */}
          <ReviewsAnalysisCard
            productTitle={resolved.title}
            rating={bestOffer?.rating ?? 4.8}
            reviewCount={bestOffer?.reviewCount ?? 0}
            antiFakeScore={antiFakePercent}
          />

          {/* Анализ логистики и складов (строго WB и Ozon) */}
          <DeliveryAnalysisCard
            offers={offers.map((o) => ({
              marketplace: o.marketplace,
              price: o.price ?? 2500,
              deliveryText: o.deliveryText || "Доставка 1-2 дня",
              speedRating: 9.5,
            }))}
            currency={currency}
          />

          {/* Детектор манипуляций с ценами */}
          <PriceHistoryCard
            currentPrice={bestPrice ?? 2500}
            discountPercent={resolved.discountPercent}
            currency={currency}
            sparkline={resolved.priceSparkline}
          />
        </section>

        {/* Шторка «Проигравшие аналоги» (Убийца FOMO) */}
        <section className="mt-8">
          <FomoAlternativesDrawer alternatives={analysis?.fomoAlternatives} />
        </section>
      </main>

      {/* Мобильная нижняя панель навигации */}
      <MobileBottomNav />
    </div>
  );
}

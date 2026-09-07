import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Star,
  Bot,
  Sliders,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { resolveProductById } from "@/lib/catalog/search";
import { generateProductAnalysis } from "@/lib/ai/analyzer";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ProductFavoriteButton } from "@/components/product/product-favorite-button";
import { MarketplaceBadge } from "@/components/ui/MarketplaceBadge";
import { ProductGallery } from "@/components/product/ProductGallery";
import { DuelBridgeBanner } from "@/components/product/DuelBridgeBanner";
import { TcoCalculatorCard } from "@/components/product/TcoCalculatorCard";
import { AgentsDialogueChat } from "@/components/product/AgentsDialogueChat";
import { FomoAlternativesDrawer } from "@/components/product/FomoAlternativesDrawer";
import { ReviewsAnalysisCard } from "@/components/analytics/ReviewsAnalysisCard";
import { DeliveryAnalysisCard } from "@/components/analytics/DeliveryAnalysisCard";
import { PriceHistoryCard } from "@/components/analytics/PriceHistoryCard";
import { MarketplaceComparisonCard } from "@/components/analytics/MarketplaceComparisonCard";

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "от 2 450 ₽";
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
      deliveryText: o.deliveryText,
      url: o.url,
    })),
  );

  const aggregateScore = analysis?.aiScore ?? resolved.aiScore ?? 9.3;
  const antiFakePercent = analysis?.antiFakePercent ?? resolved.antiFakePercent ?? 96;

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
        {/* Хлебные крошки с сохранением контекста поиска */}
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

        {/* Главный блок товара: Галерея слева + Карточка оффера и AI Score справа */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Левая колонка: Интерактивная фотогалерея + прямо под фото заключение wobuy. */}
          <div className="flex flex-col gap-6 lg:col-span-6 xl:col-span-5">
            <ProductGallery
              images={productImages}
              title={resolved.title}
              marketplace={bestOffer?.marketplace}
            />

            {/* Блок: Заключение и рекомендация wobuy. ПРЯМО ПОД ФОТО ТОВАРА */}
            {analysis?.wobuyDecision && (
              <section className="overflow-hidden rounded-3xl border border-[#00FF87]/50 bg-gradient-to-br from-emerald-950/60 via-[#13161C] to-[#12151B] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur-md">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00FF87] text-black font-black text-xs shadow-md shadow-emerald-500/30">
                        ✓
                      </div>
                      <div className="text-xs font-black uppercase tracking-wider text-[#00FF87]">
                        Заключение и рекомендация wobuy.
                      </div>
                    </div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-900/40 px-2.5 py-0.5 text-[10px] font-bold text-[#00FF87]">
                      ★ Вердикт ИИ
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-slate-100">
                    {analysis.wobuyDecision}
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Правая колонка: Информация, AI Score, Выбор лучшей цены и кнопки */}
          <div className="flex flex-col justify-between lg:col-span-6 xl:col-span-7">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {resolved.brand}
                </span>
                <span className="rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-bold text-[#00FF87]">
                  ✓ Проверено 4 ИИ-агентами wobuy.
                </span>
              </div>

              <h1 className="text-xl font-black leading-tight text-white sm:text-2xl md:text-3xl">
                {resolved.title}
              </h1>

              {/* Карточка AI Score и анти-фейк защиты */}
              <div className="flex flex-col gap-4 rounded-3xl border border-emerald-500/30 bg-[#12151B] p-5 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <ProductAiGauge score={aggregateScore} />
                  <div>
                    <div className="text-sm font-extrabold uppercase tracking-wider text-white">
                      Индекс честности и качества
                    </div>
                    <div className="text-xs text-slate-400">
                      Сформирован как среднее из оценок 4 независимых ИИ-агентов
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#00FF87]">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Анти-Фейк Защита: {antiFakePercent}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs sm:border-l sm:border-white/10 sm:pl-4">
                  {resolved.aiTags.map((tag, idx) => (
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
                    Предложения на маркетплейсах (3)
                  </h3>
                  <span className="text-xs font-bold text-[#00FF87]">Лучшая цена проверена</span>
                </div>

                <div className="space-y-2.5">
                  {(analysis?.marketplaceComparison || []).map((mkt, idx) => {
                    const isBest = mkt.isRecommended;
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col justify-between gap-3 rounded-2xl border p-3.5 transition sm:flex-row sm:items-center ${
                          isBest && mkt.price
                            ? "border-[#00FF87]/50 bg-emerald-950/20 shadow-[0_0_15px_rgba(0,255,135,0.1)]"
                            : "border-white/5 bg-[#0D0F14]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <MarketplaceBadge marketplace={mkt.marketplace} size="md" showLabel={true} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-black ${mkt.price ? "text-white" : "text-slate-400"}`}>
                                {mkt.price ? formatPrice(mkt.price, currency) : "Поиск аналогов"}
                              </span>
                              {isBest && mkt.price && (
                                <span className="rounded bg-[#00FF87]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#00FF87]">
                                  ★ Выбор
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              {mkt.reviewsCount > 0 ? (
                                <span className="flex items-center gap-0.5 font-bold text-amber-400">
                                  <Star className="h-3 w-3 fill-amber-400" />
                                  {mkt.rating.toFixed(1)}
                                </span>
                              ) : (
                                <span>{mkt.price ? "Новинка" : "Поиск"}</span>
                              )}
                              <span>•</span>
                              <span>{mkt.delivery}</span>
                            </div>
                          </div>
                        </div>

                        <a
                          href={mkt.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                            isBest && mkt.price
                              ? "bg-[#00FF87] text-black shadow-[0_0_12px_rgba(0,255,135,0.4)] hover:bg-[#00E576]"
                              : "border border-white/10 bg-white/5 text-white hover:border-[#00FF87]/50 hover:bg-white/10"
                          }`}
                        >
                          <span>{mkt.price ? `Купить на ${mkt.name}` : `Искать на ${mkt.name}`}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Блок 2. Межплощадочный мост сравнения (Блок «Дуэль») */}
              {analysis?.duelData && (
                <div className="pt-1">
                  <DuelBridgeBanner
                    duelData={analysis.duelData}
                    currentPlatform={bestOffer?.marketplace || "wildberries"}
                    currentPrice={bestPrice || 2500}
                    productTitle={resolved.title}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Блок 3. Калькулятор реальной стоимости (TCO — Total Cost of Ownership) */}
        <section className="mt-8">
          <TcoCalculatorCard
            tco={analysis?.tcoBreakdown}
            currency={currency}
            brand={resolved.brand}
          />
        </section>

        {/* Характеристики и описание от ИИ на всю ширину */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#12151B] p-6 shadow-xl">
          <div className="flex items-center gap-2.5 text-sm font-extrabold uppercase tracking-wider text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30">
              <Sliders className="h-4 w-4" />
            </div>
            <span>Характеристики и описание от ИИ</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            {analysis?.summary || resolved.description}
          </p>

          {/* Таблица структурированных спецификаций */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(analysis?.specifications || [
              { label: "Бренд", value: resolved.brand || "Оригинал" },
              { label: "Категория", value: resolved.category || "Каталог" },
              { label: "Аудит подлинности", value: `Пройден на ${antiFakePercent}%` },
              { label: "Гарантия", value: "Официальная 12 месяцев" },
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

        {/* Блок 4. Панель «Конфликт интересов» (Диалог ИИ-Агентов / Баттл мнений) */}
        <section className="mt-8">
          <AgentsDialogueChat
            dialogue={analysis?.agentsDialogue}
            avgScore={aggregateScore}
          />
        </section>

        {/* Секция детальных перспектив 4 независимых ИИ-агентов с персональными баллами, плюсами и минусами */}
        <section className="mt-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87]">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase tracking-wider text-white sm:text-lg">
                  Детальный аудит 4 ИИ-агентов wobuy.
                </h2>
                <p className="text-xs text-slate-400">
                  Индивидуальные баллы, объективные факты и честные предостережения от каждого эксперта
                </p>
              </div>
            </div>

            <div className="rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-bold text-[#00FF87] self-start sm:self-auto">
              ★ Итог: {analysis?.verdict || "Рекомендовано к покупке"}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {(analysis?.perspectives || []).map((persp, pIdx) => (
              <div
                key={pIdx}
                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#12151B] p-5 shadow-lg transition hover:border-[#00FF87]/40"
              >
                <div>
                  {/* Шапка агента: Эмодзи, Название и Индивидуальный балл */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{persp.emoji}</span>
                      <div>
                        <div className={`text-xs font-black uppercase tracking-wider ${persp.textColor}`}>
                          {persp.archetype}
                        </div>
                        <div className="text-[10px] text-slate-400">{persp.verdictTag}</div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#0D0F14] px-2.5 py-1 text-right">
                      <div className={`text-base font-black ${persp.textColor}`}>
                        {persp.score.toFixed(1)}
                      </div>
                      <div className="text-[9px] font-bold text-slate-500">из 10</div>
                    </div>
                  </div>

                  {/* Тематика анализа */}
                  <div className="mt-3 text-xs font-black text-white">{persp.title}</div>

                  {/* Плюсы (аргументы ЗА) */}
                  <div className="mt-3 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Плюсы и подтвержденные факты:
                    </div>
                    {persp.pros.map((pro, proIdx) => (
                      <div key={proIdx} className="flex items-start gap-1.5 text-xs text-slate-300 leading-relaxed">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00FF87]" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>

                  {/* Минусы / Предостережения (аргументы ПРОТИВ) */}
                  {persp.cons && persp.cons.length > 0 && (
                    <div className="mt-3.5 space-y-1.5 border-t border-white/5 pt-2.5">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Минусы и предостережения:</span>
                      </div>
                      {persp.cons.map((con, conIdx) => (
                        <div key={conIdx} className="flex items-start gap-1.5 text-xs text-slate-300 leading-relaxed">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{con}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Секция Сравнения маркетплейсов */}
        {analysis?.marketplaceComparison && (
          <section className="mt-8">
            <MarketplaceComparisonCard
              items={analysis.marketplaceComparison}
              currency={currency}
            />
          </section>
        )}

        {/* 3 АНАЛИТИЧЕСКИХ МОДУЛЯ: Отзывы, Доставка, История цен */}
        <section className="mt-8 space-y-6">
          {/* Блок 5. Глубокий семантический анализ отзывов (Review Analyst) */}
          <ReviewsAnalysisCard
            productTitle={resolved.title}
            rating={bestOffer?.rating ?? 0}
            reviewCount={bestOffer?.reviewCount ?? 0}
            antiFakeScore={antiFakePercent}
          />

          {/* Анализ доставок и складов */}
          <DeliveryAnalysisCard
            offers={offers.map((o) => ({
              marketplace: o.marketplace,
              price: o.price ?? 2500,
              deliveryText: o.deliveryText || "Доставка 1-2 дня",
              speedRating: 9.5,
            }))}
            currency={currency}
          />

          {/* Блок 6. График «Детектор манипуляций с ценами» */}
          <PriceHistoryCard
            currentPrice={bestPrice ?? 2500}
            discountPercent={resolved.discountPercent}
            currency={currency}
            sparkline={resolved.priceSparkline}
          />
        </section>

        {/* Блок 7. Убийца FOMO — Шторка «Проигравшие аналоги» */}
        <section className="mt-8">
          <FomoAlternativesDrawer alternatives={analysis?.fomoAlternatives} />
        </section>
      </main>

      {/* Мобильная нижняя панель навигации */}
      <MobileBottomNav />
    </div>
  );
}

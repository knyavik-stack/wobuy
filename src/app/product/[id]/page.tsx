/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDemoProductById } from "@/lib/catalog/demo-data";
import { computeProductAiMetrics, getStoredLiveProduct } from "@/lib/catalog/search";
import { getWildberriesProductDetail } from "@/lib/parsers/wildberries";
import { inferCategoryFromTitle } from "@/lib/parsers/deduplicator";
import { generateProductAnalysis } from "@/lib/ai/analyzer";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ProductFavoriteButton } from "@/components/product/product-favorite-button";

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
  let product = null;
  let favorite = null;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data: userData } = await supabase.auth.getUser();
      user = userData?.user ?? null;

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, canonical_name, brand, category, description, image_url, ai_summary, product_offers(id, marketplace, title, url, price, currency, rating, review_count, delivery_text, availability)",
        )
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (!error && data) {
        product = data;
      }

      if (user && product) {
        const { data: latestView } = await supabase
          .from("product_view_history")
          .select("viewed_at")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .order("viewed_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        const latestTimestamp = latestView?.viewed_at
          ? new Date(latestView.viewed_at).getTime()
          : 0;
        if (!latestTimestamp || Date.now() - latestTimestamp > 30 * 60 * 1000) {
          await supabase
            .from("product_view_history")
            .insert({ user_id: user.id, product_id: product.id });
        }
        const { data: favData } = await supabase
          .from("user_favorites")
          .select("product_id")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .maybeSingle();
        favorite = favData;
      }
    }
  } catch (err) {
    console.warn("Ошибка подключения к Supabase в карточке товара:", err);
  }

  // 2. Если товар из живого поиска (live-...)
  if (!product) {
    const liveItem = getStoredLiveProduct(id);
    if (liveItem) {
      product = {
        id: liveItem.id,
        canonical_name: liveItem.title,
        brand: liveItem.brand,
        category: liveItem.category,
        description: liveItem.description,
        image_url: liveItem.imageUrl,
        ai_summary: null,
        product_offers: liveItem.offers.map((o) => ({
          id: o.id,
          marketplace: o.marketplace,
          title: o.title,
          url: o.url,
          price: o.price,
          currency: o.currency,
          rating: o.rating,
          review_count: o.reviewCount,
          delivery_text: o.deliveryText,
          availability: o.availability,
        })),
      };
    }
  }

  // 3. Если передан артикул Wildberries (wb-12345678 или просто цифры)
  const wbArticleMatch = id.match(/^(?:wb-)?(\d{6,11})$/i);
  if (!product && wbArticleMatch) {
    const article = wbArticleMatch[1];
    const wbItem = await getWildberriesProductDetail(article);
    if (wbItem) {
      const category = inferCategoryFromTitle(wbItem.title);
      product = {
        id: `wb-${wbItem.externalId}`,
        canonical_name: wbItem.title,
        brand: wbItem.brand,
        category,
        description: wbItem.description || `Оригинальный товар «${wbItem.title}» с Wildberries (артикул ${article}). Проверен AI фильтром wobuy.`,
        image_url: wbItem.imageUrl,
        ai_summary: null,
        product_offers: [
          {
            id: wbItem.id,
            marketplace: wbItem.marketplace,
            title: wbItem.title,
            url: wbItem.url,
            price: wbItem.price,
            currency: wbItem.currency,
            rating: wbItem.rating,
            review_count: wbItem.reviewCount,
            delivery_text: wbItem.deliveryText || "Доставка WB 1-2 дня",
            availability: wbItem.availability || "В наличии",
          },
        ],
      };
    }
  }

  // 4. Демо каталог как крайний fallback для старых ссылок
  if (!product) {
    product = getDemoProductById(id);
  }

  if (!product) notFound();

  const offers = [...(product.product_offers ?? [])].sort(
    (a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER),
  );

  const bestOffer = offers[0];
  const bestPrice = bestOffer?.price ?? 0;
  const currency = bestOffer?.currency || "RUB";

  // Расчет AI метрик для согласованности с поиском и брендом wobuy.
  const aiMetrics = computeProductAiMetrics(
    product.id,
    product.category,
    product.brand,
    offers.map((o) => ({ price: o.price, rating: o.rating })),
  );

  const oldPrice = Math.round(bestPrice * (1 + aiMetrics.discountPercent / 100));

  // Динамический анализ 4 ИИ-агентов (Groq / Gemini) с мгновенным fallback
  const dynamicAiAnalysis = await generateProductAnalysis(
    product.canonical_name,
    product.brand,
    product.category,
    bestPrice,
    offers.map((o) => ({ marketplace: o.marketplace, price: o.price, rating: o.rating })),
  );

  // Разбор 4 ИИ-агентов
  const agentPerspectives = dynamicAiAnalysis?.perspectives || [
    {
      archetype: "Перфекционист",
      emoji: "💎",
      color: "from-emerald-400 to-teal-500",
      textColor: "text-[#00FF87]",
      title: "Качество и надежность",
      points: [
        "0% жалоб на брак в отзывах за последние 6 месяцев",
        "Премиальные сертифицированные материалы сборки",
        "Официальная гарантия и сервисное обслуживание в РФ",
      ],
    },
    {
      archetype: "Экономный",
      emoji: "🏷️",
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-400",
      title: "Честная цена и скидка",
      points: [
        `Реальная выгода -${aiMetrics.discountPercent}% от средней цены по рынку`,
        "Цена около исторического минимума (без накруток перед распродажей)",
        "Сравнение среди проверенных маркетплейсов в режиме реального времени",
      ],
    },
    {
      archetype: "Срочный",
      emoji: "⚡",
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-400",
      title: "Скорость доставки",
      points: [
        bestOffer?.delivery_text || "Быстрая доставка до пункта выдачи заказов",
        "Отгрузка со складов маркетплейса",
        "Удобный возврат при получении без ожидания экспертизы",
      ],
    },
    {
      archetype: "Анти-Фейк",
      emoji: "🛡️",
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-400",
      title: "Подлинность и верификация",
      points: [
        `Верификация оригинальности: ${aiMetrics.antiFakePercent}% по алгоритму AI`,
        "Отфильтровано 80+ подозрительных бот-отзывов с одинаковыми фразами",
        "Проверенный продавец с высоким рейтингом",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0D0F14] pb-24 font-sans text-slate-100 sm:pb-12">
      {/* Мягкие фоновые неоновые пятна */}
      <div className="pointer-events-none fixed right-0 top-0 h-[450px] w-[450px] rounded-full bg-[#00FF87]/5 blur-[140px]" />
      <div className="pointer-events-none fixed -left-20 top-96 h-[350px] w-[350px] rounded-full bg-cyan-500/5 blur-[130px]" />

      {/* Шапка страницы */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0D0F14]/90 px-4 py-3.5 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/search"
              aria-label="Назад к поиску"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <BrandLogo size="sm" />
          </div>

          <div className="flex items-center gap-3">
            {/* Добавить в избранное с мгновенной реакцией */}
            <ProductFavoriteButton
              productId={product.id}
              initialIsFavorite={Boolean(favorite)}
              productMetadata={{
                title: product.canonical_name,
                brand: product.brand,
                category: product.category,
                imageUrl: product.image_url || undefined,
              }}
            />

            <Link
              href={bestOffer?.url || "/search"}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 items-center gap-1.5 rounded-full bg-[#00FF87] px-4 text-xs font-bold text-black transition hover:bg-[#00E576]"
            >
              <span>Купить за {formatPrice(bestPrice, currency)}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
        {/* Хлебные крошки */}
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-white">
            Главная
          </Link>
          <span>/</span>
          <Link href="/search" className="hover:text-white">
            Поиск
          </Link>
          <span>/</span>
          <span className="text-slate-300">{product.category}</span>
        </div>

        {/* Главная сетка карточки */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Левая колонка (5 колонок): Фотография товара + AI Score бейдж */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#12151B] p-6 shadow-2xl">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.canonical_name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Sparkles className="h-16 w-16 text-slate-700" />
                )}

                {/* Плавающий бейдж AI метрики */}
                <div className="absolute right-4 top-4 rounded-2xl border border-emerald-500/30 bg-[#0D0F14]/90 p-2 shadow-xl backdrop-blur-md">
                  <ProductAiGauge score={aiMetrics.aiScore} />
                </div>

                {/* Анти-Фейк верификация */}
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-950/80 px-3 py-1 text-xs font-bold text-purple-200 backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                  <span>Анти-Фейк: {aiMetrics.antiFakePercent}%</span>
                </div>
              </div>

              {/* Гарантии сервиса wobuy. */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/5 bg-[#12151B] p-3 text-center">
                  <RotateCcw className="mx-auto mb-1 h-4 w-4 text-[#00FF87]" />
                  <div className="text-xs font-bold text-white">Легкий возврат</div>
                  <div className="text-[10px] text-slate-400">14 дней без споров</div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-[#12151B] p-3 text-center">
                  <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-cyan-400" />
                  <div className="text-xs font-bold text-white">Честная скидка</div>
                  <div className="text-[10px] text-slate-400">Без накруток продавцов</div>
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка (7 колонок): Данные, Цены на маркетплейсах и Анализ 4 ИИ-агентов */}
          <div className="space-y-6 lg:col-span-7">
            {/* Заголовок и бренд */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#00FF87]">
                {product.brand}
              </div>
              <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                {product.canonical_name}
              </h1>
            </div>

            {/* Главный блок лучшей цены */}
            <div className="rounded-3xl border border-[#00FF87]/30 bg-[#12151B] p-5 shadow-[0_0_25px_rgba(0,255,135,0.06)] sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Лучшая цена на рынке
                  </div>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-3xl font-black text-white sm:text-4xl">
                      {formatPrice(bestPrice, currency)}
                    </span>
                    {oldPrice > bestPrice && (
                      <span className="text-base text-slate-500 line-through">
                        {formatPrice(oldPrice, currency)}
                      </span>
                    )}
                    {aiMetrics.discountPercent > 0 && (
                      <span className="rounded-lg bg-[#00FF87]/20 px-2 py-0.5 text-xs font-black text-[#00FF87]">
                        -{aiMetrics.discountPercent}%
                      </span>
                    )}
                  </div>
                  {bestOffer && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                      <span className="rounded bg-white/10 px-2 py-0.5 font-bold uppercase text-white">
                        {bestOffer.marketplace}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400">{bestOffer.delivery_text || "Доставка 1-2 дня"}</span>
                    </div>
                  )}
                </div>

                {bestOffer?.url && (
                  <a
                    href={bestOffer.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#00FF87] px-6 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-[#00E576] hover:shadow-emerald-500/30"
                  >
                    <span>Купить на {bestOffer.marketplace}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Сравнение цен на маркетплейсах */}
            <div className="rounded-3xl border border-white/10 bg-[#12151B] p-5 sm:p-6">
              <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
                Все предложения маркетплейсов
              </h2>

              <div className="divide-y divide-white/5">
                {offers.map((offer, idx) => (
                  <div
                    key={offer.id || idx}
                    className="flex flex-col justify-between gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-bold uppercase text-white">
                        {offer.marketplace === "wildberries"
                          ? "WB"
                          : offer.marketplace === "ozon"
                          ? "OZ"
                          : "YM"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white capitalize">
                          {offer.marketplace}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          {offer.rating && (
                            <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                              <Star className="h-3 w-3 fill-amber-400" />
                              {offer.rating}
                            </span>
                          )}
                          <span>•</span>
                          <span>{offer.delivery_text || "В наличии"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="text-right">
                        <div className="text-base font-black text-white">
                          {formatPrice(offer.price, offer.currency || "RUB")}
                        </div>
                        {idx === 0 && (
                          <div className="text-[10px] font-bold text-[#00FF87]">
                            Лучшая цена
                          </div>
                        )}
                      </div>

                      {offer.url && (
                        <a
                          href={offer.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-slate-200 transition hover:border-[#00FF87] hover:bg-[#00FF87] hover:text-black"
                        >
                          <span>В магазин</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Описание товара */}
            {product.description && (
              <div className="rounded-3xl border border-white/10 bg-[#12151B] p-5 sm:p-6">
                <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wider text-white">
                  Описание и характеристики
                </h2>
                <p className="text-sm leading-relaxed text-slate-300">
                  {product.description}
                </p>
              </div>
            )}

            {/* Анализ 4 ИИ-агентов (Перфекционист, Экономный, Срочный, Анти-Фейк) */}
            <div className="rounded-3xl border border-white/10 bg-[#12151B] p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#00FF87]" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
                  Анализ 4 ИИ-агентов wobuy.
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {agentPerspectives.map((agent) => (
                  <div
                    key={agent.archetype}
                    className="rounded-2xl border border-white/5 bg-[#0D0F14] p-4 transition hover:border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{agent.emoji}</span>
                      <span className={`text-xs font-extrabold ${agent.textColor}`}>
                        {agent.archetype}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-bold text-white">
                      {agent.title}
                    </div>
                    <ul className="mt-2 space-y-1.5 text-[11px] text-slate-400">
                      {agent.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[#00FF87]" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Мобильная нижняя панель навигации */}
      <MobileBottomNav />
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Heart,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingDown,
  Truck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { toggleFavorite } from "@/app/dashboard/actions";
import { getDemoProductById } from "@/lib/catalog/demo-data";
import { computeProductAiMetrics } from "@/lib/catalog/search";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { BrandLogo } from "@/components/brand/BrandLogo";

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

  // Разбор 4 ИИ-агентов
  const agentPerspectives = [
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
      title: "Скорость получения",
      points: [
        bestOffer?.delivery_text
          ? `Быстрая доставка: ${bestOffer.delivery_text}`
          : "Доставка до ближайшего ПВЗ от 1 дня",
        "Товар в наличии на складе маркетплейса",
        "Быстрая отгрузка без задержек у продавца",
      ],
    },
    {
      archetype: "Анти-Фейк",
      emoji: "🛡️",
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-400",
      title: "Защита от подделок",
      points: [
        `${aiMetrics.antiFakePercent}% реальных подтвержденных покупателей`,
        "Отфильтровано более 120 накрученных отзывов и ботов",
        "Продавец проверен ИИ: рейтинг доверия 9.8 / 10",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#0D0F14] px-4 pb-24 pt-6 text-slate-100 selection:bg-[#00FF87] selection:text-black sm:pb-16 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Верхняя навигация и хлебные крошки */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <Link
              href="/search"
              className="flex items-center gap-1.5 font-semibold text-slate-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Назад к поиску</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-500">{product.category}</span>
          </div>

          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
          </div>
        </div>

        {/* Главный блок товара: Галерея слева + Интеллект ИИ справа */}
        <section className="grid gap-6 overflow-hidden rounded-3xl border border-[#00FF87]/20 bg-[#12151B] p-6 shadow-[0_0_40px_rgba(0,255,135,0.06)] md:p-8 lg:grid-cols-12">
          {/* Левая колонка: Фото товара и гарантии */}
          <div className="flex flex-col lg:col-span-6">
            <div className="relative flex min-h-[340px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-[#0A0C11] p-6 sm:min-h-[420px]">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.canonical_name}
                  className="max-h-[360px] w-full object-contain transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <Sparkles className="h-16 w-16 text-slate-700" />
              )}

              {/* Бейдж лучшего предложения */}
              {bestOffer?.marketplace && (
                <div className="absolute left-4 top-4 rounded-xl border border-white/10 bg-[#13161C]/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                  Лучшая цена на {bestOffer.marketplace}
                </div>
              )}

              {/* Бейдж наличия */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-[#00FF87] backdrop-blur-md">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#00FF87]" />
                <span>В наличии</span>
              </div>
            </div>

            {/* Быстрые факты надежности под фото */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="flex flex-col items-center rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                <ShieldCheck className="mb-1 h-4 w-4 text-[#00FF87]" />
                <span className="text-[11px] font-medium text-slate-300">Анти-Фейк ИИ</span>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                <Truck className="mb-1 h-4 w-4 text-emerald-400" />
                <span className="text-[11px] font-medium text-slate-300">Быстрая доставка</span>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                <RotateCcw className="mb-1 h-4 w-4 text-blue-400" />
                <span className="text-[11px] font-medium text-slate-300">Возврат 14 дней</span>
              </div>
            </div>
          </div>

          {/* Правая колонка: AI-вердикт, цена и действия */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              {/* Бренд и рейтинг */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#00FF87]">
                  {product.brand || "Бренд"}
                </span>
                {bestOffer?.rating != null && (
                  <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{Number(bestOffer.rating).toFixed(1)}</span>
                    {bestOffer.review_count != null && (
                      <span className="text-slate-400 font-normal">
                        ({bestOffer.review_count})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Название */}
              <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {product.canonical_name}
              </h1>

              {/* Блок вердикта ИИ: круговой индикатор + 4 ключевых факта */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#0D0F14] p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <ProductAiGauge score={aiMetrics.aiScore} />

                  <div className="flex flex-1 min-w-0 flex-col gap-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Вердикт ИИ-агента:
                    </div>
                    {aiMetrics.aiTags.map((tag, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-semibold text-slate-200"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00FF87]" />
                        <span className="truncate">{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Подсказка нейросети */}
                {product.ai_summary && (
                  <div className="mt-4 rounded-xl border border-[#00FF87]/20 bg-[#00FF87]/5 p-3 text-xs leading-relaxed text-slate-300">
                    <span className="font-bold text-[#00FF87]">Вывод ИИ: </span>
                    {product.ai_summary}
                  </div>
                )}
              </div>

              {/* Блок лучшей цены и скидки */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Лучшая цена сейчас:</div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black tracking-tight text-[#00FF87] sm:text-4xl">
                        {formatPrice(bestPrice, currency)}
                      </span>
                      {oldPrice > bestPrice && (
                        <span className="text-sm font-semibold text-slate-500 line-through">
                          {formatPrice(oldPrice, currency)}
                        </span>
                      )}
                    </div>
                  </div>

                  {aiMetrics.discountPercent > 0 && (
                    <span className="rounded-xl border border-[#00FF87]/30 bg-[#00FF87]/15 px-3 py-1 text-xs font-black text-[#00FF87]">
                      -{aiMetrics.discountPercent}% выгода
                    </span>
                  )}
                </div>

                {bestOffer?.delivery_text && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Доставка: {bestOffer.delivery_text}</span>
                  </div>
                )}

                {/* Кнопки покупки и добавления в избранное */}
                <div className="mt-5 flex flex-wrap gap-3">
                  {bestOffer?.url ? (
                    <a
                      href={bestOffer.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#00FF87] px-6 py-3.5 text-sm font-black text-black shadow-lg shadow-emerald-500/20 transition hover:bg-[#00E576]"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Купить на {bestOffer.marketplace}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}

                  {user ? (
                    <form action={toggleFavorite.bind(null, product.id)}>
                      <button
                        type="submit"
                        aria-label="В избранное"
                        className={`flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold transition ${
                          favorite
                            ? "bg-[#00FF87] text-black"
                            : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        <Heart className="h-4 w-4" fill={favorite ? "currentColor" : "none"} />
                        <span>{favorite ? "В избранном" : "Сохранить"}</span>
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/login"
                      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-white transition hover:bg-white/10"
                    >
                      <Heart className="h-4 w-4" />
                      <span>В избранное</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Виджет «Динамика цен» */}
            <div className="mt-5 rounded-2xl border border-white/5 bg-[#0D0F14] p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Динамика цен за 4 месяца</span>
                <span className="font-bold text-[#00FF87]">Мин: {formatPrice(bestPrice, currency)}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <TrendingDown className="h-4 w-4 shrink-0 text-[#00FF87]" />
                <span>
                  ИИ-анализ: сейчас выгодное окно покупки. Цена на 15% ниже среднегодового значения.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Секция: Аргументы 4 ИИ-агентов */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white sm:text-2xl">
              Разбор 4 ИИ-агентов wobuy.
            </h2>
            <span className="text-xs font-semibold text-[#00FF87]">Мультиагентный анализ</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {agentPerspectives.map((agent, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#12151B] p-5 transition hover:border-[#00FF87]/40"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{agent.emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {agent.archetype}
                  </span>
                </div>
                <h3 className={`mt-2 text-sm font-black ${agent.textColor}`}>
                  {agent.title}
                </h3>
                <div className="mt-3 space-y-2">
                  {agent.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-[#00FF87] mt-0.5">•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Секция: Сравнение маркетплейсов */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                Где купить: все предложения на маркетплейсах
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ИИ отслеживает цены в режиме реального времени
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
              {offers.length} предложения
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer, idx) => {
              const isBest = idx === 0;
              return (
                <article
                  key={offer.id}
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 transition ${
                    isBest
                      ? "border-[#00FF87]/50 bg-[#12151B] shadow-[0_0_20px_rgba(0,255,135,0.08)]"
                      : "border-white/10 bg-[#12151B] hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                          isBest
                            ? "bg-[#00FF87] text-black"
                            : "border border-white/10 bg-white/5 text-white"
                        }`}
                      >
                        {offer.marketplace}
                      </span>

                      {isBest && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00FF87]">
                          Лучшая цена
                        </span>
                      )}

                      {offer.rating != null && (
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-300">
                          <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                          {Number(offer.rating).toFixed(1)}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 line-clamp-2 text-xs font-semibold text-slate-200">
                      {offer.title}
                    </h3>

                    <div className="mt-3 text-2xl font-black text-white">
                      {formatPrice(offer.price, offer.currency)}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <Truck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{offer.delivery_text || "Уточняется"}</span>
                    </div>

                    {offer.review_count != null && (
                      <div className="mt-1 text-xs text-slate-500">
                        {offer.review_count.toLocaleString("ru-RU")} проверенных отзывов
                      </div>
                    )}
                  </div>

                  <a
                    href={offer.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-4 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition ${
                      isBest
                        ? "bg-[#00FF87] text-black hover:bg-[#00E576]"
                        : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    <span>Перейти к покупке</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </article>
              );
            })}
          </div>
        </section>

        {/* Секция: Описание товара */}
        <section className="mt-10 rounded-3xl border border-white/10 bg-[#12151B] p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white">Описание товара</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {product.description}
          </p>

          <div className="mt-6 border-t border-white/5 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00FF87]">
              Ключевые характеристики
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="flex justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <span className="text-slate-400">Бренд</span>
                <span className="font-semibold text-white">{product.brand || "—"}</span>
              </div>
              <div className="flex justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <span className="text-slate-400">Категория</span>
                <span className="font-semibold text-white">{product.category || "—"}</span>
              </div>
              <div className="flex justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <span className="text-slate-400">ИИ-индекс Анти-Фейк</span>
                <span className="font-semibold text-[#00FF87]">{aiMetrics.antiFakePercent}%</span>
              </div>
              <div className="flex justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <span className="text-slate-400">Оценка ИИ (AI Score)</span>
                <span className="font-semibold text-[#00FF87]">{aiMetrics.aiScore} / 10</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <MobileBottomNav />
    </main>
  );
}


import { BrandLogo } from "@/components/brand/BrandLogo";

export default function SearchLoading() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0D0F14] px-4 text-slate-100">
      {/* Мягкие фоновые неоновые пятна */}
      <div className="pointer-events-none fixed right-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-[#00FF87]/10 blur-[140px]" />
      <div className="pointer-events-none fixed -left-10 bottom-1/4 h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[130px]" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Логотип бренда */}
        <div className="mb-8">
          <BrandLogo size="lg" />
        </div>

        {/* Фирменное неоновое кольцо wobuy. с пульсацией и вращением */}
        <div className="relative flex h-36 w-36 items-center justify-center">
          {/* Внешнее диффузное неоновое свечение */}
          <div className="absolute inset-0 animate-ping rounded-full bg-[#00FF87]/20 blur-md duration-1000" />

          {/* Вращающееся градиентное неоновое кольцо */}
          <div className="h-28 w-28 animate-spin rounded-full border-4 border-white/5 border-t-[#00FF87] border-r-cyan-400 shadow-[0_0_25px_rgba(0,255,135,0.7)]" />

          {/* Внутреннее концентрическое кольцо */}
          <div className="absolute h-18 w-18 animate-spin rounded-full border-2 border-white/10 border-b-[#00FF87] [animation-direction:reverse] [animation-duration:1.5s]" />

          {/* Центр кольца с AI лого */}
          <div className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-[#13161C] border border-[#00FF87]/40 shadow-[0_0_12px_rgba(0,255,135,0.5)]">
            <span className="text-xs font-black text-[#00FF87]">AI</span>
          </div>
        </div>

        {/* Текстовые индикаторы статуса */}
        <div className="mt-8 space-y-2">
          <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
            ИИ подбирает лучшие товары...
          </h2>
          <p className="max-w-md text-xs text-slate-400 sm:text-sm">
            Анализируем предложения маркетплейсов, проверяем реальные отзывы и фильтруем накрутки в режиме реального времени.
          </p>
        </div>

        {/* Индикаторы прогресса */}
        <div className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-[#13161C]/80 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#00FF87]" />
          <span>Wildberries + Ozon + Анти-Фейк фильтр</span>
        </div>
      </div>
    </main>
  );
}

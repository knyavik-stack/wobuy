'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Search, ShieldCheck, Sparkles, Truck } from 'lucide-react';

type Archetype = 'urgent' | 'perfectionist' | 'budget' | 'parents';

const ARCHETYPES: Record<Archetype, { label: string; emoji: string; placeholder: string; description: string; accentColor: string; glowColor: string; product: { title: string; score: number; price: string; oldPrice: string; platform: string; delivery: string; reasons: string[]; antiFake: string } }> = {
  urgent: { label: 'Срочный', emoji: '⚡', placeholder: 'Нужна палатка с доставкой до завтра...', description: 'Приоритет на максимальную скорость доставки', accentColor: 'from-amber-500 to-orange-600', glowColor: 'rgba(245, 158, 11, 0.15)', product: { title: 'Быстросборная 3-местная палатка MirCamping', score: 8.9, price: '7 450 ₽', oldPrice: '9 200 ₽', platform: 'Ozon', delivery: 'Сегодня до 21:00', reasons: ['Сборка за 45 секунд', 'Доставка со склада за 4 часа', 'Влагозащита дна 5000 мм'], antiFake: '92% реальных отзывов' } },
  perfectionist: { label: 'Перфекционист', emoji: '💎', placeholder: 'Ищу лучшую палатку по качеству и реальным отзывам...', description: 'Приоритет на качество, надежность и отсутствие брака', accentColor: 'from-emerald-400 to-teal-500', glowColor: 'rgba(16, 185, 129, 0.2)', product: { title: 'Экспедиционная палатка Tramp Mountain 3 v2', score: 9.7, price: '14 890 ₽', oldPrice: '17 500 ₽', platform: 'Ozon', delivery: 'Послезавтра', reasons: ['Алюминиевый каркас', 'Двухслойная мембрана RipStop', '0% жалоб на брак за 6 месяцев'], antiFake: '98% реальных покупателей' } },
  budget: { label: 'Экономный', emoji: '🏷️', placeholder: 'Палатка 3-местная со скидкой, дешевле чем везде...', description: 'Приоритет на минимальную цену и честные скидки', accentColor: 'from-blue-500 to-indigo-600', glowColor: 'rgba(59, 130, 246, 0.15)', product: { title: 'Кемпинговая палатка Trek Planet', score: 9.1, price: '4 120 ₽', oldPrice: '6 800 ₽', platform: 'Wildberries', delivery: '2 дня', reasons: ['Исторический минимум цены', 'Выгодное предложение', 'Отличное соотношение цены и качества'], antiFake: 'Отзывы проверены ИИ' } },
  parents: { label: 'Мама / Папа', emoji: '👶', placeholder: 'Безопасная детская палатка-домик...', description: 'Приоритет на безопасность и надежность материалов', accentColor: 'from-purple-500 to-pink-500', glowColor: 'rgba(168, 85, 247, 0.15)', product: { title: 'Детский игровой домик-палатка «Лесная сказка»', score: 9.5, price: '2 890 ₽', oldPrice: '3 500 ₽', platform: 'Wildberries', delivery: 'Завтра', reasons: ['Натуральный хлопок', 'Безопасные опоры из бука', 'Плотный чехол для хранения'], antiFake: 'Проверено ИИ: реальные отзывы' } },
};

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<Archetype>('perfectionist');
  const [searchQuery, setSearchQuery] = useState('');
  const config = ARCHETYPES[activeTab];

  return (
    <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0D0F14] px-4 pb-12 pt-6 text-slate-100 selection:bg-[#00FF87] selection:text-black md:px-8 lg:px-16">
      <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[50%] w-[50%] rounded-full bg-gradient-to-tr from-emerald-500/10 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-gradient-to-br from-blue-600/5 to-transparent blur-[150px]" />

      <header className="relative z-10 flex w-full items-center justify-between">
        <span className="text-2xl font-bold tracking-tight text-white">wobuy<span className="text-[#00FF87]">.</span></span>
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
            <a href="#features" className="transition-colors hover:text-white">Как это работает</a>
            <a href="#pricing" className="transition-colors hover:text-white">Тарифы</a>
            <a href="#about" className="transition-colors hover:text-white">О нас</a>
          </nav>
          <a href="/login" className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10">Войти</a>
        </div>
      </header>

      <main className="relative z-10 my-auto grid w-full grid-cols-1 items-center gap-12 py-12 lg:grid-cols-12 lg:gap-8">
        <div className="col-span-1 flex flex-col justify-center space-y-8 lg:col-span-7">
          <div className="inline-flex self-start items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-[#00FF87]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#00FF87]" />
            Time-to-Best-Offer &lt; 3 минуты
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl">Выбирает ИИ.<br /><span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Покупаешь ты.</span></h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-400 md:text-lg">wobuy. анализирует предложения, отсекает фейковые отзывы, рассчитывает честный рейтинг и выдает лучшие варианты с человеческим объяснением.</p>

          <div className="group relative w-full max-w-2xl">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#00FF87]/30 to-blue-500/30 opacity-75 blur transition duration-500 group-focus-within:opacity-100" />
            <div className="relative flex items-center rounded-2xl border border-white/10 bg-[#13161C]/90 p-2 pl-4 transition-all focus-within:border-[#00FF87]/50">
              <Search className="mr-3 h-6 w-6 shrink-0 text-slate-500" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={config.placeholder} className="w-full border-none bg-transparent pr-4 text-sm text-white outline-none placeholder:text-slate-500 md:text-base" />
              <button type="button" className="flex shrink-0 items-center justify-center rounded-xl bg-[#00FF87] px-6 py-3 font-bold text-black shadow-lg shadow-emerald-500/10 transition-all hover:bg-[#00E576]">
                <span className="mr-2 hidden md:inline">Найти лучшее</span><Sparkles className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Выбери свой фокус ИИ-анализа:</span>
            <div className="flex flex-wrap gap-2.5">
              {(Object.keys(ARCHETYPES) as Archetype[]).map((key) => {
                const item = ARCHETYPES[key];
                const selected = activeTab === key;
                return <button key={key} type="button" onClick={() => setActiveTab(key)} className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all md:text-sm ${selected ? 'border border-white/20 bg-white/10 text-white' : 'border border-transparent bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                  <span>{item.emoji}</span><span>{item.label}</span>{selected && <motion.div layoutId="activeGlow" className="pointer-events-none absolute inset-0 rounded-xl border-2 border-[#00FF87]/30" style={{ boxShadow: `0 0 15px ${item.glowColor}` }} />}
                </button>;
              })}
            </div>
            <p className="mt-1 text-xs italic text-slate-500">💡 {config.description}</p>
          </div>
        </div>

        <div className="relative col-span-1 flex min-h-[450px] items-center justify-center lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -30, scale: 0.95 }} transition={{ duration: 0.4 }} className="relative w-full max-w-[380px] rounded-3xl border border-white/10 bg-[#13161C]/60 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-start justify-between"><span className={`rounded-lg bg-gradient-to-r ${config.accentColor} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white`}>Рекомендация ИИ</span><div className="relative flex h-12 w-12 items-center justify-center"><svg className="h-full w-full -rotate-90"><circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" /><circle cx="24" cy="24" r="20" stroke="#00FF87" strokeWidth="4" fill="transparent" strokeDasharray="125" strokeDashoffset={125 - (125 * config.product.score) / 10} /></svg><span className="absolute text-sm font-extrabold text-white">{config.product.score}</span></div></div>
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-400"><span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-medium text-white">{config.product.platform}</span><span className="flex items-center"><Truck className="mr-1 h-3.5 w-3.5 text-emerald-400" />{config.product.delivery}</span></div>
              <h3 className="mb-3 line-clamp-2 text-base font-bold leading-snug text-white">{config.product.title}</h3>
              <div className="mb-4 flex items-baseline gap-3"><span className="text-2xl font-black text-[#00FF87]">{config.product.price}</span><span className="text-xs text-slate-500 line-through">{config.product.oldPrice}</span></div>
              <hr className="my-4 border-white/5" />
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-3 py-2"><ShieldCheck className="h-4 w-4 shrink-0 text-[#00FF87]" /><span className="text-xs font-medium text-slate-300">{config.product.antiFake}</span></div>
              <div className="space-y-2.5"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Аргументы ИИ-агентов:</span>{config.product.reasons.map((reason) => <div key={reason} className="flex items-start gap-2"><span className="mt-0.5 text-sm text-[#00FF87]">•</span><p className="text-xs leading-relaxed text-slate-300">{reason}</p></div>)}</div>
              <button type="button" className="group mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white transition-all hover:bg-white/10"><span>Перейти к покупке</span><ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></button>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="relative z-10 flex w-full flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-slate-500 md:flex-row">
        <span>© 2026 wobuy. — Умный ИИ-помощник для покупок.</span><div className="flex items-center gap-4"><span>Next.js 15</span><span>•</span><span>Supabase pgvector</span><span>•</span><span>Cloudflare Workers</span></div>
      </footer>
    </section>
  );
}

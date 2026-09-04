'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, ArrowUpDown, ShieldCheck, 
  ChevronRight, TrendingDown, TrendingUp, Filter, Info,
  ExternalLink, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';

// Интерфейсы данных
interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  oldPrice: number;
  score: number;
  platform: 'Wildberries' | 'Ozon' | 'Yandex Market';
  deliveryTime: string;
  antiFakeScore: number;
  antiFakeVerdict: string;
  aiPros: string[];
  priceHistory: number[]; // Массив цен для SVG-графика
  imageUrl: string;
}

// Мок-данные для выдачи (наш поисковый запрос: "туристическая палатка 3 местная")
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Экспедиционная палатка Tramp Mountain 3 v2',
    brand: 'Tramp',
    price: 14890,
    oldPrice: 17500,
    score: 9.7,
    platform: 'Ozon',
    deliveryTime: 'Завтра, ПВЗ 150м',
    antiFakeScore: 98,
    antiFakeVerdict: 'Проверено ИИ: отзывы от реальных людей',
    aiPros: [
      'Алюминиевый каркас авиационного класса (выдержит шторм)',
      '0% жалоб на брак за последние полгода',
      'Огромные тамбуры для хранения рюкзаков'
    ],
    priceHistory: [16800, 16500, 15900, 15400, 14890],
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-2',
    title: 'Быстросборная 3-местная палатка MirCamping',
    brand: 'MirCamping',
    price: 7450,
    oldPrice: 9200,
    score: 8.9,
    platform: 'Wildberries',
    deliveryTime: 'Сегодня, экспресс',
    antiFakeScore: 92,
    antiFakeVerdict: 'Накрутки отсутствуют, высокий траст',
    aiPros: [
      'Автоматический каркас — сборка за 45 секунд',
      'Идеально для кемпинга выходного дня',
      'Очень плотная ткань дна (5000 мм)'
    ],
    priceHistory: [8900, 8900, 8200, 7800, 7450],
    imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-3',
    title: 'Кемпинговая палатка туристическая Trek Planet Vario 3',
    brand: 'Trek Planet',
    price: 4120,
    oldPrice: 6800,
    score: 9.1,
    platform: 'Wildberries',
    deliveryTime: '2 дня',
    antiFakeScore: 89,
    antiFakeVerdict: 'Очищено от 120 накрученных отзывов конкурентов',
    aiPros: [
      'Реальная выгода 39% (честная скидка подтверждена ИИ)',
      'Отличная вентиляция благодаря 3 клапанам',
      'Самая низкая цена за этот функционал на рынке'
    ],
    priceHistory: [6800, 6800, 5900, 4300, 4120],
    imageUrl: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-4',
    title: 'Палатка Greenell Клэр 3 v2',
    brand: 'Greenell',
    price: 11900,
    oldPrice: 12500,
    score: 8.3,
    platform: 'Ozon',
    deliveryTime: 'Послезавтра',
    antiFakeScore: 64,
    antiFakeVerdict: 'Внимание: обнаружено 36% накрученных отзывов',
    aiPros: [
      'Просторный внутренний спальный отсек',
      'Быстрая установка дуг в карманы',
      'Ткань тента устойчива к УФ-лучам'
    ],
    priceHistory: [11500, 11500, 11900, 11900, 11900],
    imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500&auto=format&fit=crop&q=60'
  }
];

export default function SearchResults() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(8.0);
  const [sortBy, setSortBy] = useState<'score' | 'price_asc' | 'price_desc'>('score');
  const [searchQuery, setSearchQuery] = useState('туристическая палатка 3 местная');
  const [activeDetailsId, setActiveDetailsId] = useState<string | null>(null);

  // Фильтрация и сортировка данных
  const filteredProducts = useMemo(() => {
    let result = [...MOCK_PRODUCTS];

    // Фильтр по платформе
    if (selectedPlatform !== 'all') {
      result = result.filter(p => p.platform === selectedPlatform);
    }

    // Фильтр по минимальному Score
    result = result.filter(p => p.score >= minScore);

    // Сортировка
    if (sortBy === 'score') {
      result.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedPlatform, minScore, sortBy]);

  // Генерация простейшей кривой SVG для графика изменения цены
  const getSvgPath = (history: number[]) => {
    const width = 120;
    const height = 30;
    const maxVal = Math.max(...history);
    const minVal = Math.min(...history);
    const range = maxVal - minVal || 1;

    const points = history.map((val, index) => {
      const x = (index / (history.length - 1)) * width;
      // Инвертируем Y, так как координаты SVG идут сверху вниз
      const y = height - ((val - minVal) / range) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0F14] text-slate-100 font-sans p-4 md:p-8 selection:bg-[#00FF87] selection:text-black relative overflow-hidden">
      
      {/* Мягкие световые пятна */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ШАПКА РЕЗУЛЬТАТОВ */}
      <header className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
        <div>
          {/* Логотип */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl font-bold tracking-tight text-white">
              wobuy<span className="text-[#00FF87]">.</span>
            </span>
            <span className="text-[10px] bg-white/5 border border-white/10 text-slate-400 font-semibold px-2 py-0.5 rounded">
              ИИ-Результаты
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Запрос:</span>
            <span className="text-slate-200 font-medium bg-white/5 px-2 py-1 rounded">
              «{searchQuery}»
            </span>
          </div>
        </div>

        {/* Быстрый поисковый инпут в шапке */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#13161C] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/30 transition-all"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ЛЕВАЯ ПАНЕЛЬ: Фильтры (3 колонки в сетке) */}
        <aside className="col-span-1 lg:col-span-3 bg-[#13161C]/50 border border-white/10 rounded-2xl p-5 backdrop-blur-md h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center">
              <SlidersHorizontal className="w-4 h-4 mr-2 text-[#00FF87]" />
              ИИ-Фильтры
            </h2>
            <button 
              onClick={() => { setSelectedPlatform('all'); setMinScore(8.0); setSortBy('score'); }}
              className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Сбросить</span>
            </button>
          </div>

          {/* Фильтр по маркетплейсу */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-400 block">Маркетплейс</span>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'all', label: 'Все площадки' },
                { id: 'Ozon', label: 'Ozon' },
                { id: 'Wildberries', label: 'Wildberries' }
              ].map((plat) => (
                <button
                  key={plat.id}
                  onClick={() => setSelectedPlatform(plat.id)}
                  className={`w-full text-left text-xs px-3.5 py-2.5 rounded-xl border font-semibold transition-all ${
                    selectedPlatform === plat.id
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {plat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Слайдер минимального ИИ-Score */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-400">Минимальный Score</span>
              <span className="text-[#00FF87] bg-[#00FF87]/10 px-1.5 py-0.5 rounded">{minScore.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="6.0"
              max="9.8"
              step="0.1"
              value={minScore}
              onChange={(e) => setMinScore(parseFloat(e.target.value))}
              className="w-full accent-[#00FF87] bg-slate-800 rounded-lg appearance-none h-1 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block leading-relaxed">
              Отсекает товары с низким рейтингом ИИ-агентов.
            </span>
          </div>

          {/* Сортировка */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-400 block">Сортировка</span>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'score', label: 'По Score (Рекомендуемые)' },
                { id: 'price_asc', label: 'Сначала дешевые' },
                { id: 'price_desc', label: 'Сначала дорогие' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id as any)}
                  className={`w-full text-left text-xs px-3.5 py-2.5 rounded-xl border font-semibold transition-all ${
                    sortBy === opt.id
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center space-x-2 text-[10px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Score учитывает отзывы, цену, накрутки и доставку.</span>
          </div>
        </aside>

        {/* ПРАВАЯ ЧАСТЬ: Сетка результатов поиска */}
        <section className="col-span-1 lg:col-span-9 space-y-4">
          
          {/* Бадж-статистика выдачи */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Найдено предложений: <strong className="text-white">{filteredProducts.length}</strong></span>
            <span className="text-[#00FF87] flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Всего отсеяно фейков: ~156
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((product) => {
                  const isExpanded = activeDetailsId === product.id;
                  const isSuspicious = product.antiFakeScore < 70;

                  return (
                    <motion.div
                      layout
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className={`relative rounded-2xl border bg-[#13161C]/50 transition-all duration-300 ${
                        isExpanded ? 'border-white/20 ring-1 ring-white/10 bg-[#13161C]/80' : 'border-white/5 hover:border-white/15'
                      }`}
                    >
                      {/* Верхняя часть карточки (основной контент) */}
                      <div className="p-5 flex flex-col justify-between h-full min-h-[300px]">
                        
                        {/* Изображение, бренд и Score */}
                        <div className="flex justify-between items-start space-x-4 mb-4">
                          <div className="flex space-x-3.5">
                            {/* Имитация превью картинки товара */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 relative shrink-0 border border-white/5">
                              <img 
                                src={product.imageUrl} 
                                alt={product.title}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                              />
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white uppercase">
                                {product.platform}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                                {product.brand}
                              </span>
                              <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                                {product.title}
                              </h3>
                            </div>
                          </div>

                          {/* Score-кольцо */}
                          <div className="relative flex items-center justify-center w-11 h-11 shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="transparent" />
                              <circle 
                                cx="22" 
                                cy="22" 
                                r="18" 
                                stroke={product.score >= 9.0 ? '#00FF87' : product.score >= 8.0 ? '#3B82F6' : '#EF4444'} 
                                strokeWidth="3" 
                                fill="transparent"
                                strokeDasharray="113"
                                strokeDashoffset={113 - (113 * product.score) / 10}
                              />
                            </svg>
                            <span className="absolute text-xs font-black text-white">{product.score}</span>
                          </div>
                        </div>

                        {/* Цены, график и доставка */}
                        <div className="flex items-center justify-between gap-2 mt-auto pt-4 border-t border-white/5">
                          <div>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-xl font-black text-[#00FF87]">{product.price.toLocaleString('ru-RU')} ₽</span>
                              <span className="text-xs text-slate-500 line-through">{(product.oldPrice).toLocaleString('ru-RU')}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Доставка: {product.deliveryTime}
                            </span>
                          </div>

                          {/* Мини-график цены */}
                          <div className="flex flex-col items-end space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Цена (30д)</span>
                            <div className="flex items-center space-x-2">
                              {product.priceHistory[0] > product.price ? (
                                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                              )}
                              <svg width="60" height="20" className="stroke-slate-500 fill-none stroke-2">
                                <path d={getSvgPath(product.priceHistory)} stroke={product.priceHistory[0] > product.price ? '#00FF87' : '#EF4444'} />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Блок Анти-Фейка */}
                        <div className={`mt-4 flex items-center space-x-2 px-3 py-2 rounded-xl border ${
                          isSuspicious 
                            ? 'bg-red-500/5 border-red-500/10 text-red-400' 
                            : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                        }`}>
                          {isSuspicious ? (
                            <AlertCircle className="w-4 h-4 shrink-0" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                          )}
                          <span className="text-xs font-semibold leading-tight line-clamp-1">
                            {product.antiFakeVerdict}
                          </span>
                        </div>

                        {/* Кнопка открытия деталей и перехода */}
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => setActiveDetailsId(isExpanded ? null : product.id)}
                            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-bold text-white transition-all"
                          >
                            {isExpanded ? 'Скрыть аргументы ИИ' : 'Почему этот выбор?'}
                          </button>
                          <a 
                            href={`https://${product.platform.toLowerCase()}.ru/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2.5 rounded-xl bg-[#00FF87] hover:bg-[#00E576] text-black font-bold text-xs flex items-center justify-center transition-all shadow-lg shadow-emerald-500/5"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>

                      </div>

                      {/* Нижняя раскрывающаяся панель с выжимками ИИ (Аргументами) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden bg-black/20 border-t border-white/5 rounded-b-2xl"
                          >
                            <div className="p-5 space-y-3.5">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center">
                                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#00FF87]" />
                                Анализ ИИ-агентов
                              </span>
                              <div className="space-y-2.5">
                                {product.aiPros.map((pro, index) => (
                                  <div key={index} className="flex items-start space-x-2">
                                    <span className="text-[#00FF87] text-sm mt-0.5">•</span>
                                    <p className="text-xs text-slate-300 leading-relaxed">{pro}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-[#13161C]/30 border border-white/5 rounded-2xl p-6">
                <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-base font-bold text-white mb-2">Товары не найдены</h3>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                  Попробуйте снизить минимальный Score в фильтрах слева или изменить параметры поиска.
                </p>
              </div>
            )}
          </AnimatePresence>

        </section>

      </main>
    </div>
  );
}

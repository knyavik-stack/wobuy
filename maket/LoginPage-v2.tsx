'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, Loader2, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Имитация задержки авторизации Supabase
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Вход выполнен:', { email });
    } catch (err: any) {
      setErrorMessage(err.message || 'Неверный адрес почты или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0F14] text-slate-100 flex overflow-hidden font-sans selection:bg-[#00FF87] selection:text-black">
      
      {/* ЛЕВАЯ ЧАСТЬ: Кинематографичный брендовый промо-блок (виден только на больших экранах) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#090B11] border-r border-white/5 flex-col justify-between p-16 overflow-hidden">
        
        {/* Фоновое свечение в стиле оптической призмы */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-[#00FF87]/10 to-transparent blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-blue-600/5 to-transparent blur-[150px] pointer-events-none" />
        
        {/* Шапка логотипа */}
        <div className="relative z-10 flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tight text-white">
            wobuy<span className="text-[#00FF87] animate-pulse">.</span>
          </span>
          <span className="text-[10px] bg-[#00FF87]/10 border border-[#00FF87]/20 text-[#00FF87] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            ИИ-Ассистент
          </span>
        </div>

        {/* Интерактивный виджет в стиле "Quiet Luxury" */}
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Твой честный проводник <br />
              в мире маркетплейсов<span className="text-[#00FF87]">.</span>
            </h1>
            <p className="text-base text-slate-400 leading-relaxed">
              Войди в свой личный кабинет, чтобы получить неограниченный доступ к ИИ-агентам, детекторам накруток и истории цен.
            </p>
          </div>

          {/* Интерактивная карточка статуса ИИ */}
          <div className="bg-[#13161C]/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-white/15 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00FF87]/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#00FF87]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Оркестратор WOBuy</h4>
                <p className="text-[10px] text-slate-500">Система активна и защищает ваши покупки</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>Очищено фейковых отзывов за сутки: <strong className="text-white">12,450+</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>Сэкономлено времени пользователей: <strong className="text-white">840 часов</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>Показатель Time-to-Best-Offer: <strong className="text-white">~2.4 минуты</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Подвал левой стороны */}
        <div className="relative z-10 flex justify-between text-xs text-slate-500">
          <span>© 2026 wobuy.ru</span>
          <span>Бесплатный старт без инвестиций</span>
        </div>

      </div>

      {/* ПРАВАЯ ЧАСТЬ: Премиальная форма авторизации */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-16 relative">
        
        {/* Световое фоновое свечение для мобильных */}
        <div className="absolute inset-0 bg-[#0D0F14]" />
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-bl from-blue-600/5 to-transparent blur-[120px] pointer-events-none lg:hidden" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-[#00FF87]/5 to-transparent blur-[120px] pointer-events-none lg:hidden" />

        {/* Адаптивный верхний блок логотипа для мобильных */}
        <div className="absolute top-8 left-8 z-10 lg:hidden">
          <span className="text-2xl font-bold tracking-tight text-white">
            wobuy<span className="text-[#00FF87]">.</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[400px] z-10"
        >
          {/* Заголовок формы */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Рады видеть тебя вновь
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed">
              Введи свои данные для входа в умное пространство WOBuy
            </p>
          </div>

          {/* Форма на стеклянной карте (Glassmorphism 2.0) */}
          <div className="bg-[#13161C]/50 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative">
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#00FF87]/40 to-transparent" />

            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Вывод ошибки */}
              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Электронная почта
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={isLoading}
                    className="w-full bg-[#0D0F14]/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 transition-all disabled:opacity-50"
                  />
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500 group-focus-within:text-[#00FF87] transition-colors" />
                </div>
              </div>

              {/* Пароль */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Пароль
                  </label>
                  <a href="/auth/reset" className="text-xs font-semibold text-[#00FF87] hover:underline">
                    Забыл пароль?
                  </a>
                </div>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full bg-[#0D0F14]/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 transition-all disabled:opacity-50"
                  />
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500 group-focus-within:text-[#00FF87] transition-colors" />
                </div>
              </div>

              {/* Кнопка отправки */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E576] disabled:bg-emerald-800 disabled:opacity-50 text-black font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Авторизация...</span>
                  </>
                ) : (
                  <>
                    <span>Войти в WOBuy</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Ссылка на регистрацию */}
          <p className="text-center text-xs text-slate-400 mt-6 font-medium">
            Новый пользователь?{' '}
            <a href="/auth/register" className="text-[#00FF87] hover:underline font-bold">
              Создать аккаунт бесплатно
            </a>
          </p>

        </motion.div>
      </div>

    </div>
  );
}
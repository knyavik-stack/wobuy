'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setErrorMessage('Необходимо согласиться с политикой конфиденциальности');
      setIsLoading(false);
      return;
    }

    try {
      // Имитация задержки авторизации Supabase
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Регистрация успешна:', { name, email });
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка регистрации нового пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0F14] text-slate-100 flex overflow-hidden font-sans selection:bg-[#00FF87] selection:text-black">
      
      {/* ЛЕВАЯ ЧАСТЬ: Кинематографичный промо-блок */}
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

        {/* Промо-виджет */}
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Покупай с умом. <br />
              Сэкономь до 90% времени<span className="text-[#00FF87]">.</span>
            </h1>
            <p className="text-base text-slate-400 leading-relaxed">
              Создай бесплатный аккаунт, чтобы сохранять свои любимые товары, настраивать автоматические ИИ-оповещения о скидках и отсекать фейковые отзывы в один клик.
            </p>
          </div>

          {/* Интерактивная карточка в стиле "Quiet Luxury" */}
          <div className="bg-[#13161C]/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-white/15 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00FF87]/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center">
                <ShieldCheck className="w-4.5 h-4.5 text-[#00FF87]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Безопасный старт</h4>
                <p className="text-[10px] text-slate-500">Защита пользовательских данных на уровне ядра</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>Изолированное хранение паролей (Supabase Auth)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>Включенные политики безопасности Row Level Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>0 рублей за обслуживание и скрытые платежи</span>
              </div>
            </div>
          </div>
        </div>

        {/* Подвал */}
        <div className="relative z-10 flex justify-between text-xs text-slate-500">
          <span>© 2026 wobuy.ru</span>
          <span>Zero-Budget AI Platform</span>
        </div>

      </div>

      {/* ПРАВАЯ ЧАСТЬ: Премиальная форма регистрации */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-16 relative">
        
        {/* Световые эффекты для мобильных */}
        <div className="absolute inset-0 bg-[#0D0F14]" />
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-bl from-blue-600/5 to-transparent blur-[120px] pointer-events-none lg:hidden" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-[#00FF87]/5 to-transparent blur-[120px] pointer-events-none lg:hidden" />

        {/* Адаптивный верх для мобильных */}
        <div className="absolute top-8 left-8 z-10 lg:hidden">
          <span className="text-2xl font-bold tracking-tight text-white">
            wobuy<span className="text-[#00FF87]">.</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[400px] z-10 py-12"
        >
          {/* Заголовок */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Создать аккаунт
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1.5 leading-relaxed">
              Зарегистрируйся, чтобы начать умный шопинг без накруток
            </p>
          </div>

          {/* Карта регистрации (Glassmorphism 2.0) */}
          <div className="bg-[#13161C]/50 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative">
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#00FF87]/40 to-transparent" />

            <form onSubmit={handleRegister} className="space-y-4">
              
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

              {/* Имя */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Имя
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Александр"
                    disabled={isLoading}
                    className="w-full bg-[#0D0F14]/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 transition-all disabled:opacity-50"
                  />
                  <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500 group-focus-within:text-[#00FF87] transition-colors" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Пароль
                </label>
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

              {/* Подтверждение пароля */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Подтверждение пароля
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full bg-[#0D0F14]/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 transition-all disabled:opacity-50"
                  />
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500 group-focus-within:text-[#00FF87] transition-colors" />
                </div>
              </div>

              {/* Чекбокс */}
              <div className="flex items-start space-x-2.5 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  disabled={isLoading}
                  className="mt-1 w-4 h-4 rounded border-white/10 bg-[#0D0F14]/80 text-[#00FF87] focus:ring-[#00FF87]/40 outline-none cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-slate-400 leading-normal select-none cursor-pointer">
                  Согласен с обработкой{' '}
                  <a href="/privacy" className="text-[#00FF87] hover:underline font-semibold">
                    персональных данных
                  </a>{' '}
                  и правилами платформы.
                </label>
              </div>

              {/* Кнопка отправки */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E576] disabled:bg-emerald-800 disabled:opacity-50 text-black font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Создание...</span>
                  </>
                ) : (
                  <>
                    <span>Начать бесплатно</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Ссылка на авторизацию */}
          <p className="text-center text-xs text-slate-400 mt-6 font-medium">
            Уже зарегистрирован?{' '}
            <a href="/auth/login" className="text-[#00FF87] hover:underline font-bold">
              Войти в свой кабинет
            </a>
          </p>

        </motion.div>
      </div>

    </div>
  );
}
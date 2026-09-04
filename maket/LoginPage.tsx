'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';

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
      // Шаблон интеграции с Supabase Auth:
      // const { error } = await supabase.auth.signInWithPassword({ email, password });
      // if (error) throw error;
      // router.push('/dashboard');
      
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Имитация запроса
      console.log('Вход выполнен:', { email });
    } catch (err: any) {
      setErrorMessage(err.message || 'Неверный email или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0F14] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-[#00FF87] selection:text-black">
      
      {/* Мягкие световые колодцы на фоне */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#00FF87]/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-500/5 to-transparent blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[420px] z-10"
      >
        {/* Логотип */}
        <div className="text-center mb-8">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            wobuy<span className="text-[#00FF87] animate-pulse">.</span>
          </span>
          <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide uppercase">
            Вход в умный кабинет покупателя
          </p>
        </div>

        {/* Форма */}
        <div className="bg-[#13161C]/80 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#00FF87]/50 to-transparent" />

          <h2 className="text-xl font-bold text-white mb-6">Добро пожаловать</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Электронная почта
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isLoading}
                  className="w-full bg-[#0D0F14]/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 transition-all disabled:opacity-50"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
              </div>
            </div>

            {/* Пароль */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Пароль
                </label>
                <a 
                  href="/reset-password" 
                  className="text-xs text-[#00FF87] hover:text-[#00E576] transition-colors font-semibold"
                >
                  Забыли пароль?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-[#0D0F14]/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 transition-all disabled:opacity-50"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
              </div>
            </div>

            {/* Кнопка войти */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E576] text-black font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/5 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Войти в аккаунт</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          {/* Разделитель */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <span className="relative bg-[#13161C] px-3 text-[10px] uppercase font-bold tracking-widest text-slate-500">
              или
            </span>
          </div>

          {/* Быстрый вход (в будущем) */}
          <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#00FF87]" />
            <span>Продолжить как гость</span>
          </button>

        </div>

        {/* Ссылка на регистрацию */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Ещё нет аккаунта?{' '}
          <a href="/register" className="text-[#00FF87] hover:text-[#00E576] transition-colors font-bold">
            Зарегистрироваться
          </a>
        </p>

      </motion.div>
    </div>
  );
}

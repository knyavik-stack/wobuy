'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Вы должны согласиться с обработкой персональных данных');
      setIsLoading(false);
      return;
    }

    try {
      // Шаблон интеграции с Supabase Auth Signup:
      // const { data, error } = await supabase.auth.signUp({
      //   email,
      //   password,
      //   options: {
      //     data: { display_name: name }
      //   }
      // });
      // if (error) throw error;
      
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Имитация запроса
      setSuccessMessage('Регистрация успешна! Проверьте почту для подтверждения аккаунта.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка регистрации. Попробуйте еще раз.');
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
        className="w-full max-w-[440px] z-10"
      >
        {/* Логотип */}
        <div className="text-center mb-8">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            wobuy<span className="text-[#00FF87] animate-pulse">.</span>
          </span>
          <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide uppercase">
            Создание аккаунта AI-помощника
          </p>
        </div>

        {/* Форма */}
        <div className="bg-[#13161C]/80 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#00FF87]/50 to-transparent" />

          <h2 className="text-xl font-bold text-white mb-6">Быстрая регистрация</h2>

          {successMessage ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 text-center py-4"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/20 text-[#00FF87] mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {successMessage}
              </p>
              <a 
                href="/login" 
                className="inline-flex items-center justify-center w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all"
              >
                Перейти к авторизации
              </a>
            </motion.div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              
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

              {/* Имя */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Ваше имя
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Александр"
                    disabled={isLoading}
                    className="w-full bg-[#0D0F14]/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 transition-all disabled:opacity-50"
                  />
                  <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                </div>
              </div>

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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Пароль
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    disabled={isLoading}
                    className="w-full bg-[#0D0F14]/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 transition-all disabled:opacity-50"
                  />
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                </div>
              </div>

              {/* Подтверждение пароля */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Подтвердите пароль
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full bg-[#0D0F14]/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 transition-all disabled:opacity-50"
                  />
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                </div>
              </div>

              {/* Чекбокс согласия */}
              <div className="flex items-start space-x-2.5 pt-2">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-[#0D0F14]/60 text-[#00FF87] accent-[#00FF87] mt-0.5 outline-none cursor-pointer"
                />
                <label htmlFor="agree-terms" className="text-xs text-slate-400 leading-normal cursor-pointer">
                  Я согласен на{' '}
                  <a href="/privacy" className="text-[#00FF87] hover:underline font-semibold">
                    обработку персональных данных
                  </a>{' '}
                  и условия использования.
                </label>
              </div>

              {/* Кнопка */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E576] text-black font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/5 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Создать аккаунт</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>

        {/* Ссылка на авторизацию */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Уже есть аккаунт?{' '}
          <a href="/login" className="text-[#00FF87] hover:text-[#00E576] transition-colors font-bold">
            Войти в систему
          </a>
        </p>

      </motion.div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  const [isResetMode, setIsResetMode] = useState(false); // false: запрос ссылки, true: ввод нового пароля
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // В Next.js 15 при переходе по ссылке восстановления Supabase присылает хэш или код восстановления.
    // Если в URL есть token/type=recovery, мы переключаем интерфейс на ввод нового пароля.
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || window.location.search;
      if (hash.includes('type=recovery') || hash.includes('recovery')) {
        setIsResetMode(true);
      }
    }
  }, []);

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Шаблон интеграции с Supabase Auth Reset Link:
      // const { error } = await supabase.auth.resetPasswordForEmail(email, {
      //   redirectTo: `${window.location.origin}/reset-password`,
      // });
      // if (error) throw error;
      
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Имитация запроса
      setSuccessMessage('Ссылка для сброса пароля отправлена на вашу электронную почту.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка отправки запроса. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    try {
      // Шаблон обновления пароля в Supabase Auth:
      // const { error } = await supabase.auth.updateUser({ password });
      // if (error) throw error;
      
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Имитация запроса
      setSuccessMessage('Ваш пароль успешно изменен! Теперь вы можете войти в систему.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка изменения пароля.');
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
            Безопасное восстановление доступа
          </p>
        </div>

        {/* Форма */}
        <div className="bg-[#13161C]/80 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#00FF87]/50 to-transparent" />

          <h2 className="text-xl font-bold text-white mb-6">
            {isResetMode ? 'Новый пароль' : 'Восстановление доступа'}
          </h2>

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
                Вернуться на страницу входа
              </a>
            </motion.div>
          ) : (
            <div>
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-4"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* Экран 1: Запрос ссылки */}
              {!isResetMode ? (
                <form onSubmit={handleRequestLink} className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Укажите адрес электронной почты, связанный с вашим аккаунтом. Мы отправим вам безопасную ссылку для сброса пароля.
                  </p>

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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6 py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E576] text-black font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/5 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Получить ссылку</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Экран 2: Ввод нового пароля */
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Новый пароль
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
                      <KeyRound className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Подтвердите новый пароль
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6 py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E576] text-black font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/5 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Обновить пароль</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Ссылка на авторизацию */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Вспомнили пароль?{' '}
          <a href="/login" className="text-[#00FF87] hover:text-[#00E576] transition-colors font-bold">
            Войти в аккаунт
          </a>
        </p>

      </motion.div>
    </div>
  );
}

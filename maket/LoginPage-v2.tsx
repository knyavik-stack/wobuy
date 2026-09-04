"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function authError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "Неверный email или пароль.";
  if (normalized.includes("email not confirmed")) return "Подтверди email по ссылке из письма.";
  if (normalized.includes("rate limit")) return "Слишком много попыток. Попробуй позже.";
  return "Не удалось выполнить вход. Проверь данные и попробуй ещё раз.";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMessage(authError(error.message));
      setIsLoading(false);
      return;
    }
    window.location.assign("/dashboard");
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-[#0D0F14] font-sans text-slate-100 selection:bg-[#00FF87] selection:text-black">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-white/5 bg-[#090B11] p-8 lg:flex lg:px-10 lg:py-6">
        <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[80%] w-[80%] rounded-full bg-gradient-to-tr from-[#00FF87]/10 to-transparent blur-[150px]" />
        <div className="relative z-10 flex items-center space-x-2"><Link href="/" className="text-2xl font-bold tracking-tight text-white">wobuy<span className="text-[#00FF87]">.</span></Link><span className="rounded-full border border-[#00FF87]/20 bg-[#00FF87]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00FF87]">ИИ-Ассистент</span></div>
        <div className="relative z-10 my-auto max-w-lg space-y-8"><div className="space-y-4"><h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">Твой честный проводник <br />в мире маркетплейсов<span className="text-[#00FF87]">.</span></h1><p className="text-base leading-relaxed text-slate-400">Войди в личный кабинет, чтобы сохранять товары, видеть историю и работать с результатами поиска.</p></div><div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#13161C]/40 p-6 backdrop-blur-xl"><div className="mb-4 flex items-center space-x-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#00FF87]/20 bg-[#00FF87]/10"><Sparkles className="h-4 w-4 text-[#00FF87]" /></div><div><h4 className="text-xs font-bold uppercase tracking-wider text-white">Демо-каталог</h4><p className="text-[10px] text-slate-500">Система готова для проверки пользовательского сценария</p></div></div><div className="space-y-2.5 text-xs text-slate-300"><div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#00FF87]" /><span>12 демо-товаров</span></div><div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#00FF87]" /><span>16 демо-предложений маркетплейсов</span></div><div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#00FF87]" /><span>Поиск и карточки товаров работают на реальных данных каталога</span></div></div></div></div>
        <div className="relative z-10 text-xs text-slate-500">© 2026 wobuy. · Бесплатный демо-режим</div>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center p-6 md:p-16 lg:w-1/2"><div className="pointer-events-none absolute inset-0 bg-[#0D0F14]" /><div className="relative z-10 w-full max-w-[400px]"><motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}><div className="mb-8"><h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">Рады видеть тебя вновь</h2><p className="mt-2 text-xs leading-relaxed text-slate-400 md:text-sm">Введи данные для входа в личный кабинет wobuy.</p></div><div className="relative rounded-2xl border border-white/10 bg-[#13161C]/50 p-6 shadow-2xl backdrop-blur-xl md:p-8"><div className="absolute left-1/4 right-1/4 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF87]/40 to-transparent" /><form onSubmit={handleLogin} className="space-y-4"><AnimatePresence mode="wait">{errorMessage ? <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-start space-x-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-semibold text-red-400"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{errorMessage}</span></motion.div> : null}</AnimatePresence><div className="space-y-2"><label className="block text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="login-email">Электронная почта</label><div className="group relative"><input id="login-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" disabled={isLoading} className="w-full rounded-xl border border-white/10 bg-[#0D0F14]/70 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 disabled:opacity-50" /><Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-[#00FF87]" /></div></div><div className="space-y-2"><div className="flex items-center justify-between"><label className="block text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="login-password">Пароль</label><Link href="/forgot-password" className="text-xs font-semibold text-[#00FF87] hover:underline">Забыл пароль?</Link></div><div className="group relative"><input id="login-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" disabled={isLoading} className="w-full rounded-xl border border-white/10 bg-[#0D0F14]/70 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 disabled:opacity-50" /><Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-[#00FF87]" /></div></div><button type="submit" disabled={isLoading} className="mt-6 flex w-full items-center justify-center space-x-2 rounded-xl bg-[#00FF87] py-3.5 text-sm font-extrabold text-black shadow-lg shadow-emerald-500/10 transition-all hover:bg-[#00E576] disabled:cursor-not-allowed disabled:bg-emerald-800 disabled:opacity-50">{isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Авторизация...</span></> : <><span>Войти в wobuy.</span><ArrowRight className="h-4 w-4" /></>}</button></form></div><p className="mt-6 text-center text-xs font-medium text-slate-400">Новый пользователь? <Link href="/register" className="font-bold text-[#00FF87] hover:underline">Создать аккаунт бесплатно</Link></p><p className="mt-4 text-center"><Link href="/" className="text-xs font-semibold text-slate-500 hover:text-white">← На главную</Link></p></motion.div></div></div>
    </div>
  );
}

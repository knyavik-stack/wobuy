"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2, ChevronLeft, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function translateError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("same password")) return "Новый пароль должен отличаться от предыдущего.";
  if (normalized.includes("password should be at least")) return "Пароль должен содержать не менее 6 символов.";
  if (normalized.includes("session") || normalized.includes("token")) return "Ссылка устарела или недействительна. Запроси новую ссылку.";
  if (normalized.includes("rate limit")) return "Слишком много попыток. Попробуй позже.";
  return "Не удалось выполнить операцию. Попробуй ещё раз.";
}

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function detectRecoverySession() {
      const { data } = await supabase.auth.getSession();
      setRecoveryMode(Boolean(data.session));
      setLoading(false);
    }

    detectRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(Boolean(session));
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (authError) {
      setError(translateError(authError.message));
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов.");
      return;
    }
    if (password !== confirmation) {
      setError("Пароли не совпадают.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password });

    if (authError) {
      setError(translateError(authError.message));
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  }

  const recoveryTitle = recoveryMode ? "Новый пароль" : "Восстановление";
  const recoveryDescription = recoveryMode
    ? "Придумай новый пароль для своего личного кабинета."
    : "Введи email — мы отправим безопасную ссылку для смены пароля.";

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-[#0D0F14] font-sans text-slate-100 selection:bg-[#00FF87] selection:text-black">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/5 bg-[#090B11] p-16 lg:flex lg:w-1/2">
        <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[80%] w-[80%] rounded-full bg-gradient-to-tr from-[#00FF87]/10 to-transparent blur-[150px]" />
        <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-gradient-to-br from-blue-600/5 to-transparent blur-[150px]" />
        <div className="relative z-10 flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">wobuy<span className="text-[#00FF87]">.</span></span>
          <span className="rounded-full border border-[#00FF87]/20 bg-[#00FF87]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00FF87]">ИИ-Ассистент</span>
        </div>
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">Безопасное восстановление твоего доступа<span className="text-[#00FF87]">.</span></h1>
            <p className="text-base leading-relaxed text-slate-400">Ссылка восстановления привязывается к защищённой сессии. Пароль меняется только после успешной проверки доступа.</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#13161C]/40 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#00FF87]/20 bg-[#00FF87]/10"><ShieldCheck className="h-4 w-4 text-[#00FF87]" /></div>
              <div><h4 className="text-xs font-bold uppercase tracking-wider text-white">Защита аккаунта</h4><p className="text-[10px] text-slate-500">Supabase Auth + защищённая сессия</p></div>
            </div>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#00FF87]" />Одноразовая ссылка восстановления</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#00FF87]" />Пароль меняется только в активной сессии</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#00FF87]" />Без раскрытия существования аккаунта</div>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex justify-between text-xs text-slate-500"><span>© 2026 wobuy.</span><span>Security & Isolation Standard</span></div>
      </div>

      <div className="relative flex w-full items-center justify-center overflow-hidden p-6 md:p-16 lg:w-1/2">
        <div className="absolute inset-0 bg-[#0D0F14]" />
        <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[70%] w-[70%] rounded-full bg-gradient-to-tr from-[#00FF87]/5 to-transparent blur-[120px] lg:hidden" />
        <div className="absolute left-8 top-8 z-10 lg:hidden"><span className="text-2xl font-bold tracking-tight text-white">wobuy<span className="text-[#00FF87]">.</span></span></div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="relative z-10 w-full max-w-[400px]">
          <Link href="/login" className="mb-6 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors hover:text-white"><ChevronLeft className="h-3.5 w-3.5" />Назад на страницу входа</Link>
          <div className="mb-6"><h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">{recoveryTitle}</h2><p className="mt-1.5 text-xs leading-relaxed text-slate-400 md:text-sm">{recoveryDescription}</p></div>

          <div className="relative rounded-2xl border border-white/10 bg-[#13161C]/50 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="absolute left-1/4 right-1/4 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF87]/40 to-transparent" />
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-[#00FF87]" /></div>
            ) : success ? (
              <div className="space-y-4 py-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#00FF87]/20 bg-[#00FF87]/10"><CheckCircle2 className="h-6 w-6 text-[#00FF87]" /></div>
                <h3 className="text-base font-bold text-white">{recoveryMode ? "Пароль изменён" : "Письмо отправлено"}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{recoveryMode ? "Новый пароль сохранён. Теперь можешь войти в личный кабинет." : "Если аккаунт с таким email существует, мы отправили ссылку для восстановления. Проверь папку «Спам», если письмо не пришло."}</p>
                <Link href="/login" className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#00FF87] py-3 text-xs font-extrabold text-black transition-all hover:bg-[#00E576]">Войти в аккаунт<ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            ) : (
              <form onSubmit={recoveryMode ? handlePasswordUpdate : handleRequest} className="space-y-4">
                {error ? <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-semibold text-red-400"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div> : null}
                {recoveryMode ? (
                  <>
                    <label className="block space-y-2"><span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Новый пароль</span><div className="relative"><input type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" disabled={submitting} className="w-full rounded-xl border border-white/10 bg-[#0D0F14]/70 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 disabled:opacity-50" /><Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" /></div></label>
                    <label className="block space-y-2"><span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Подтверждение пароля</span><div className="relative"><input type="password" required minLength={6} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="••••••••" disabled={submitting} className="w-full rounded-xl border border-white/10 bg-[#0D0F14]/70 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 disabled:opacity-50" /><Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" /></div></label>
                    <button type="submit" disabled={submitting} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00FF87] py-3.5 text-sm font-extrabold text-black transition-all hover:bg-[#00E576] disabled:opacity-50">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}{submitting ? "Сохраняем…" : "Сохранить новый пароль"}</button>
                  </>
                ) : (
                  <>
                    <label className="block space-y-2"><span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Электронная почта</span><div className="relative"><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" disabled={submitting} className="w-full rounded-xl border border-white/10 bg-[#0D0F14]/70 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#00FF87]/50 focus:ring-1 focus:ring-[#00FF87]/20 disabled:opacity-50" /><Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" /></div></label>
                    <button type="submit" disabled={submitting} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00FF87] py-3.5 text-sm font-extrabold text-black transition-all hover:bg-[#00E576] disabled:opacity-50">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}{submitting ? "Отправляем письмо…" : "Отправить ссылку"}</button>
                  </>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

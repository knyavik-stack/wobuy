"use client";

import Link from "next/link";
import { useState, useMemo, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { validatePassword } from "@/lib/utils/password-policy";
import { secureLogger } from "@/lib/utils/secure-logger";

function translateError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("already registered") || normalized.includes("already been registered"))
    return "Этот email уже зарегистрирован. Войди в аккаунт или восстанови пароль.";
  if (normalized.includes("password") && normalized.includes("at least"))
    return "Пароль должен содержать не менее 8 символов (латиница, заглавные, строчные, цифры).";
  if (normalized.includes("rate limit")) return "Слишком много попыток. Попробуй позже.";
  if (normalized.includes("invalid email")) return "Проверь формат электронной почты.";
  return "Не удалось создать аккаунт. Проверь данные и попробуй ещё раз.";
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const passwordAnalysis = useMemo(() => validatePassword(password), [password]);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!passwordAnalysis.isValid) {
      return setErrorMessage(
        passwordAnalysis.errorMessage || "Пароль не соответствует требованиям безопасности.",
      );
    }

    if (password !== confirmPassword) {
      return setErrorMessage("Пароли не совпадают.");
    }

    if (!agreeToTerms) {
      return setErrorMessage(
        "Необходимо согласиться с политикой конфиденциальности и правилами платформы.",
      );
    }

    setIsLoading(true);
    secureLogger.info("Регистрация нового пользователя", { email: email.trim() });

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: name.trim() } },
    });

    if (error) {
      secureLogger.warn("Ошибка регистрации:", error.message);
      setErrorMessage(translateError(error.message));
      setIsLoading(false);
      return;
    }

    if (data.session) {
      window.location.assign("/dashboard");
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  }

  return (
    <main className="flex min-h-screen w-full bg-[#0D0F14] text-slate-100 selection:bg-[#00FF87] selection:text-black">
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-white/5 bg-[#090B11] p-16 lg:flex">
        <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[80%] w-[80%] rounded-full bg-gradient-to-tr from-[#00FF87]/10 to-transparent blur-[150px]" />
        <div className="relative z-10">
          <BrandLogo size="md" />
        </div>
        <div className="relative z-10 max-w-lg space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
              Покупай с умом.
              <br />
              Экономь время<span className="text-[#00FF87]">.</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              Сохраняй товары, историю просмотров и результаты поиска. Демо-каталог уже готов для
              проверки сценария.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#13161C]/50 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#00FF87]" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Безопасный старт
              </span>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#00FF87]" />
                Пароли хранит Supabase Auth
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#00FF87]" />
                Данные пользователя защищены RLS
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#00FF87]" />
                Подтверждение email поддерживается
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-xs text-slate-500">
          © 2026 wobuy. · Бесплатный демо-режим
        </div>
      </section>

      <section className="relative flex w-full items-center justify-center overflow-hidden p-6 md:p-16 lg:w-1/2">
        <div className="absolute inset-0 bg-[#0D0F14]" />
        <div className="relative z-10 w-full max-w-[420px] py-12">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <BrandLogo size="md" />
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>На главную</span>
            </Link>
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
              Создать аккаунт
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Зарегистрируйся, чтобы начать умный шопинг без накруток.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#13161C]/60 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            {success ? (
              <div className="space-y-4 py-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-[#00FF87]" />
                <h3 className="text-lg font-bold text-white">Проверь email</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Мы отправили письмо для подтверждения адреса. После подтверждения войди в личный
                  кабинет.
                </p>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#00FF87] py-3 text-sm font-extrabold text-black hover:bg-[#00E576]"
                >
                  Перейти ко входу <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {errorMessage ? (
                  <div
                    role="alert"
                    className="flex gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-semibold text-red-400"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                ) : null}
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Имя
                  </span>
                  <div className="relative">
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      disabled={isLoading}
                      placeholder="Александр"
                      className="w-full rounded-xl border border-white/10 bg-[#0D0F14]/70 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-[#00FF87]/50 disabled:opacity-50"
                    />
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  </div>
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Электронная почта
                  </span>
                  <div className="relative">
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      disabled={isLoading}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-white/10 bg-[#0D0F14]/70 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-[#00FF87]/50 disabled:opacity-50"
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  </div>
                </label>
                <label className="block space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Пароль
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="h-3 w-3 text-slate-400" />
                          <span>Скрыть</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 text-slate-400" />
                          <span>Показать</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      required
                      minLength={8}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={isLoading}
                      placeholder="••••••••"
                      className={`w-full rounded-xl border bg-[#0D0F14]/70 py-3 pl-11 pr-10 text-sm text-white outline-none transition-all disabled:opacity-50 ${
                        password
                          ? passwordAnalysis.isValid
                            ? "border-[#00FF87]/60 focus:border-[#00FF87]"
                            : "border-amber-500/50 focus:border-amber-500"
                          : "border-white/10 focus:border-[#00FF87]/50"
                      }`}
                    />
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  </div>

                  {/* Индикатор сложности и требований к паролю */}
                  {password ? (
                    <div className="space-y-2.5 rounded-xl border border-white/5 bg-[#090B11] p-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Надежность пароля:</span>
                        <span
                          className={`font-bold ${
                            passwordAnalysis.score >= 100
                              ? "text-[#00FF87]"
                              : passwordAnalysis.score >= 60
                                ? "text-amber-400"
                                : "text-rose-400"
                          }`}
                        >
                          {passwordAnalysis.score >= 100
                            ? "Отличный"
                            : passwordAnalysis.score >= 60
                              ? "Средний"
                              : "Слабый"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordAnalysis.score >= 100
                              ? "bg-[#00FF87]"
                              : passwordAnalysis.score >= 60
                                ? "bg-amber-400"
                                : "bg-rose-500"
                          }`}
                          style={{ width: `${passwordAnalysis.score}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                        <div
                          className={`flex items-center gap-1.5 ${
                            passwordAnalysis.criteria.minLength
                              ? "text-[#00FF87]"
                              : "text-slate-500"
                          }`}
                        >
                          {passwordAnalysis.criteria.minLength ? (
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 shrink-0" />
                          )}
                          <span>Мин. 8 символов</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 ${
                            passwordAnalysis.criteria.isLatinOnly
                              ? "text-[#00FF87]"
                              : "text-slate-500"
                          }`}
                        >
                          {passwordAnalysis.criteria.isLatinOnly ? (
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 shrink-0" />
                          )}
                          <span>Только латиница</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 ${
                            passwordAnalysis.criteria.hasUpper
                              ? "text-[#00FF87]"
                              : "text-slate-500"
                          }`}
                        >
                          {passwordAnalysis.criteria.hasUpper ? (
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 shrink-0" />
                          )}
                          <span>Заглавная (A-Z)</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 ${
                            passwordAnalysis.criteria.hasLower
                              ? "text-[#00FF87]"
                              : "text-slate-500"
                          }`}
                        >
                          {passwordAnalysis.criteria.hasLower ? (
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 shrink-0" />
                          )}
                          <span>Строчная (a-z)</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 ${
                            passwordAnalysis.criteria.hasNumber
                              ? "text-[#00FF87]"
                              : "text-slate-500"
                          }`}
                        >
                          {passwordAnalysis.criteria.hasNumber ? (
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 shrink-0" />
                          )}
                          <span>Цифра (0-9)</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Подтверждение пароля
                  </span>
                  <div className="relative">
                    <input
                      required
                      minLength={8}
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={isLoading}
                      placeholder="••••••••"
                      className={`w-full rounded-xl border bg-[#0D0F14]/70 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all disabled:opacity-50 ${
                        confirmPassword
                          ? password === confirmPassword
                            ? "border-[#00FF87]/60 focus:border-[#00FF87]"
                            : "border-rose-500/60 focus:border-rose-500"
                          : "border-white/10 focus:border-[#00FF87]/50"
                      }`}
                    />
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  </div>
                  {confirmPassword && password !== confirmPassword ? (
                    <span className="text-[11px] font-medium text-rose-400">
                      Пароли не совпадают
                    </span>
                  ) : null}
                </label>
                <label className="flex items-start gap-2.5 pt-2 text-xs leading-relaxed text-slate-400">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    disabled={isLoading}
                    className="mt-0.5 h-4 w-4"
                  />{" "}
                  <span>
                    Согласен с{" "}
                    <Link href="/privacy" className="font-semibold text-[#00FF87] hover:underline">
                      политикой конфиденциальности
                    </Link>{" "}
                    и правилами платформы.
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00FF87] py-3.5 text-sm font-extrabold text-black hover:bg-[#00E576] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Создание...
                    </>
                  ) : (
                    <>
                      Начать бесплатно <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
          {!success ? (
            <p className="mt-6 text-center text-xs font-medium text-slate-400">
              Уже зарегистрирован?{" "}
              <Link href="/login" className="font-bold text-[#00FF87] hover:underline">
                Войти в кабинет
              </Link>
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

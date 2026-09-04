"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function translateAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "Неверный email или пароль.";
  if (normalized.includes("email not confirmed")) return "Подтверди email по ссылке из письма.";
  if (normalized.includes("user already registered")) return "Аккаунт с таким email уже существует.";
  if (normalized.includes("password should be at least")) return "Пароль должен содержать не менее 6 символов.";
  if (normalized.includes("unable to validate email")) return "Проверь корректность email.";
  if (normalized.includes("rate limit")) return "Слишком много попыток. Попробуй позже.";
  return "Не удалось выполнить операцию. Попробуй ещё раз.";
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(translateAuthError(authError.message));
      setLoading(false);
      return;
    }

    window.location.assign("/dashboard");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="login-email">Email</label>
        <Input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="login-password">Пароль</label>
        <Input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required minLength={6} />
      </div>
      {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <Button className="w-full" type="submit" disabled={loading}>{loading ? "Выполняем вход…" : "Войти"}</Button>
      <p className="text-center text-sm text-neutral-500">Нет аккаунта? <Link className="font-semibold text-neutral-950 hover:underline" href="/register">Зарегистрироваться</Link></p>
    </form>
  );
}

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmation) {
      setError("Пароли не совпадают.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (authError) {
      setError(translateAuthError(authError.message));
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.assign("/dashboard");
      return;
    }

    setSuccess("Аккаунт создан. Проверь почту и перейди по ссылке для подтверждения.");
    setLoading(false);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2"><label className="text-sm font-medium text-neutral-800" htmlFor="register-email">Email</label><Input id="register-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
      <div className="space-y-2"><label className="text-sm font-medium text-neutral-800" htmlFor="register-password">Пароль</label><Input id="register-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Не менее 6 символов" required minLength={6} /></div>
      <div className="space-y-2"><label className="text-sm font-medium text-neutral-800" htmlFor="register-confirmation">Повтори пароль</label><Input id="register-confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Повтори пароль" required minLength={6} /></div>
      {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {success ? <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
      <Button className="w-full" type="submit" disabled={loading}>{loading ? "Создаём аккаунт…" : "Создать аккаунт"}</Button>
      <p className="text-center text-sm text-neutral-500">Уже есть аккаунт? <Link className="font-semibold text-neutral-950 hover:underline" href="/login">Войти</Link></p>
    </form>
  );
}

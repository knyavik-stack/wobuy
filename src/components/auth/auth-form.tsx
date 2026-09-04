"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function translateAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "Неверный email или пароль.";
  if (normalized.includes("email not confirmed")) return "Подтверди email по ссылке из письма.";
  if (normalized.includes("user already registered"))
    return "Аккаунт с таким email уже существует.";
  if (normalized.includes("password should be at least"))
    return "Пароль должен содержать не менее 6 символов.";
  if (normalized.includes("unable to validate email")) return "Проверь корректность email.";
  if (normalized.includes("rate limit")) return "Слишком много попыток. Попробуй позже.";
  if (normalized.includes("same password")) return "Новый пароль должен отличаться от предыдущего.";
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
        <label className="text-sm font-medium text-neutral-800" htmlFor="login-email">
          Email
        </label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="почта@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-neutral-800" htmlFor="login-password">
            Пароль
          </label>
          <Link
            className="text-sm font-semibold text-neutral-700 hover:text-neutral-950 hover:underline"
            href="/forgot-password"
          >
            Забыли пароль?
          </Link>
        </div>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
        />
      </div>
      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Выполняем вход…" : "Войти"}
      </Button>
      <p className="text-center text-sm text-neutral-500">
        Нет аккаунта?{" "}
        <Link className="font-semibold text-neutral-950 hover:underline" href="/register">
          Зарегистрироваться
        </Link>
      </p>
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
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="register-email">
          Email
        </label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="почта@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="register-password">
          Пароль
        </label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Не менее 6 символов"
          required
          minLength={6}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="register-confirmation">
          Повтори пароль
        </label>
        <Input
          id="register-confirmation"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder="Повтори пароль"
          required
          minLength={6}
        />
      </div>
      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Создаём аккаунт…" : "Создать аккаунт"}
      </Button>
      <p className="text-center text-sm text-neutral-500">
        Уже есть аккаунт?{" "}
        <Link className="font-semibold text-neutral-950 hover:underline" href="/login">
          Войти
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (authError) {
      setError(translateAuthError(authError.message));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="forgot-email">
          Email
        </label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="почта@example.com"
          required
        />
      </div>
      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Если аккаунт с таким email существует, мы отправили письмо со ссылкой для смены пароля.
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Отправляем письмо…" : "Отправить ссылку"}
      </Button>
      <p className="text-center text-sm text-neutral-500">
        <Link className="font-semibold text-neutral-950 hover:underline" href="/login">
          Вернуться ко входу
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmation) {
      setError("Пароли не совпадают.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password });

    if (authError) {
      setError(translateAuthError(authError.message));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="space-y-5">
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Пароль успешно изменён. Теперь можешь войти с новым паролем.
        </p>
        <Button
          className="w-full"
          type="button"
          onClick={() => window.location.assign("/dashboard")}
        >
          Перейти в личный кабинет
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="reset-password">
          Новый пароль
        </label>
        <Input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Не менее 6 символов"
          required
          minLength={6}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="reset-confirmation">
          Повтори новый пароль
        </label>
        <Input
          id="reset-confirmation"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder="Повтори пароль"
          required
          minLength={6}
        />
      </div>
      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Сохраняем пароль…" : "Сохранить новый пароль"}
      </Button>
    </form>
  );
}

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoading(false);
      return;
    }

    window.location.assign("/login");
  }

  return (
    <Button variant="outline" size="sm" type="button" onClick={handleLogout} disabled={loading}>
      {loading ? "Выходим…" : "Выйти"}
    </Button>
  );
}

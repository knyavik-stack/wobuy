"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Save, User, Mail, Shield, KeyRound, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ProfileSettings({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = name.trim().slice(0, 80);
    setMessage("");
    setError("");
    if (!normalized) {
      setError("Имя не может быть пустым.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      data: { display_name: normalized },
    });
    setLoading(false);
    if (updateError) {
      setError("Не удалось сохранить профиль. Попробуй ещё раз.");
      return;
    }
    setName(normalized);
    setMessage("Профиль успешно обновлён!");
  }

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      {/* Форма редактирования профиля */}
      <form
        onSubmit={handleSubmit}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#13161C]/90 p-5 backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00FF87]/10 text-[#00FF87]">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Личные данные</h3>
            <p className="text-[11px] text-slate-400">Отображаемое имя в системе wobuy.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300" htmlFor="profile-name">
              Отображаемое имя
            </label>
            <div className="relative mt-1">
              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                disabled={loading}
                placeholder="Твоё имя или никнейм"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#00FF87]/50 focus:bg-white/[0.06] disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400">Привязанный Email</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2.5 text-sm text-slate-300">
              <Mail className="h-4 w-4 text-slate-500" />
              <span className="truncate">{email || "Email не указан"}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[#00FF87] px-4 py-2.5 text-xs font-black text-black shadow-[0_0_20px_rgba(0,255,135,0.2)] transition hover:bg-[#00E576] active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{loading ? "Сохраняем…" : "Сохранить изменения"}</span>
          </button>

          {message ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#00FF87]">
              <CheckCircle2 className="h-4 w-4" />
              <span>{message}</span>
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="text-xs font-medium text-red-400">
              {error}
            </p>
          ) : null}
        </div>
      </form>

      {/* Карточка безопасности */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#13161C]/90 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Безопасность и пароль</h3>
              <p className="text-[11px] text-slate-400">Защита сессий и управление доступом</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs leading-relaxed text-slate-400">
            <p>
              Авторизация и сессии защищены сквозным шифрованием через Supabase Auth и протокол OAuth 2.0.
            </p>
            <p className="text-slate-500">
              Для смены текущего пароля или восстановления доступа перейди в форму сброса: на твою почту придёт защищённая одноразовая ссылка.
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-white/5 pt-4">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <KeyRound className="h-3.5 w-3.5 text-[#00FF87]" />
            <span>Сменить пароль</span>
            <ExternalLink className="h-3 w-3 text-slate-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}

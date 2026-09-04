"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ProfileSettings({ initialName, email }: { initialName: string; email: string }) {
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
    const { error: updateError } = await supabase.auth.updateUser({ data: { display_name: normalized } });
    setLoading(false);
    if (updateError) {
      setError("Не удалось сохранить профиль. Попробуй ещё раз.");
      return;
    }
    setName(normalized);
    setMessage("Профиль сохранён.");
  }

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Профиль</div>
        <label className="mt-3 block text-xs text-slate-500" htmlFor="profile-name">Имя</label>
        <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} disabled={loading} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0D0F14] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00FF87]/50 disabled:opacity-50" />
        <div className="mt-3 text-xs text-slate-500">Email: {email}</div>
        <button type="submit" disabled={loading} className="mt-4 flex items-center gap-2 rounded-xl bg-[#00FF87] px-4 py-2.5 text-xs font-extrabold text-black hover:bg-[#00E576] disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? "Сохраняем…" : "Сохранить профиль"}
        </button>
        {message ? <p className="mt-3 flex items-center gap-1.5 text-xs text-[#00FF87]"><CheckCircle2 className="h-4 w-4" />{message}</p> : null}
        {error ? <p role="alert" className="mt-3 text-xs text-red-400">{error}</p> : null}
      </form>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Безопасность</div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">Пароль и подтверждение email управляются Supabase Auth. Для смены пароля используй восстановление доступа.</p>
        <a href="/forgot-password" className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10">Изменить пароль</a>
      </div>
    </div>
  );
}

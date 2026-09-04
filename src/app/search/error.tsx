"use client";

import Link from "next/link";

export default function SearchError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#0D0F14] px-4 text-center text-slate-100"><div className="max-w-md"><h1 className="text-2xl font-extrabold text-white">Не удалось загрузить поиск</h1><p className="mt-3 text-sm text-slate-400">Проверь соединение и попробуй ещё раз.</p><div className="mt-6 flex justify-center gap-3"><button type="button" onClick={() => reset()} className="rounded-xl bg-[#00FF87] px-5 py-3 text-sm font-bold text-black">Повторить</button><Link href="/" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white">На главную</Link></div></div></main>;
}

import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-[#0D0F14] px-4 text-center text-slate-100"><div className="max-w-md"><div className="text-5xl font-black text-[#00FF87]">404</div><h1 className="mt-4 text-2xl font-extrabold text-white">Страница не найдена</h1><p className="mt-3 text-sm leading-relaxed text-slate-400">Похоже, такой страницы больше нет. Вернись на главную или продолжи поиск товаров.</p><div className="mt-6 flex justify-center gap-3"><Link href="/" className="rounded-xl bg-[#00FF87] px-5 py-3 text-sm font-bold text-black">На главную</Link><Link href="/search" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white">К поиску</Link></div></div></main>;
}

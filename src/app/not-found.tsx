import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0D0F14] px-4 text-center text-slate-100">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[110px]" />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-[#13161C]/80 p-8 shadow-2xl backdrop-blur-xl md:p-12">
        <div className="flex justify-center">
          <BrandLogo size="md" />
        </div>
        <div className="mt-10 text-7xl font-black tracking-tight text-[#00FF87] md:text-8xl">
          404
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-white md:text-3xl">Такой страницы нет</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          Страница могла быть удалена или адрес введён с ошибкой. Вернись на главную или продолжи
          поиск товаров.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-[#00FF87] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#00E576]"
          >
            На главную
          </Link>
          <Link
            href="/search"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            К поиску
          </Link>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ShieldCheck, Sparkles, Scale } from "lucide-react";

export function Footer() {
  return (
    <footer id="global-footer" className="relative z-10 w-full border-t border-white/10 bg-[#080A0E] py-8 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-6">
        {/* Верхняя компактная линия: Бренд, статус и ссылки */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <BrandLogo size="sm" />
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-xs text-slate-300 font-medium">
              Сервис честной селекции товаров wobuy.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <Link
              href="/search"
              className="flex items-center gap-1 text-slate-400 transition hover:text-[#00FF87]"
            >
              <Scale className="h-3.5 w-3.5 text-[#00FF87]" />
              <span>Поиск товаров</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-slate-400 transition hover:text-[#00FF87]"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Кабинет</span>
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              href="/privacy"
              className="text-slate-400 transition hover:text-white"
            >
              Политика
            </Link>
            <Link
              href="/terms"
              className="text-slate-400 transition hover:text-white"
            >
              Соглашение
            </Link>
          </div>
        </div>

        {/* Объединенная монолитная строка копирайта и защиты */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 <strong className="font-bold text-white">wobuy.</strong> (домен wobuy.ru). Все права защищены.</span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-[#00FF87]" />
              <span>Защищено независимым алгоритмом Анти-Фейк.</span>
            </span>
          </div>

          <div className="text-[10px] text-slate-400">
            Без рекламы и проплаченных позиций
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ShieldCheck, Scale, Cpu, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-[#090B0F] pb-28 pt-12 text-xs text-slate-400 sm:pb-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12 pb-10 border-b border-white/5">
          {/* Колонка 1: Бренд и миссия */}
          <div className="md:col-span-5 space-y-3">
            <BrandLogo size="md" />
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Сервис честной селекции товаров на маркетплейсах. Отсекаем рекламу, ботов в отзывах и липовые скидки. Строим дуэльный арбитраж Wildberries vs Ozon по честной цене владения (TCO).
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="flex h-2 w-2 rounded-full bg-[#00FF87] animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-400">
                ИИ-конвейер селекции активен (WB + Ozon)
              </span>
            </div>
          </div>

          {/* Колонка 2: Навигация и поиск */}
          <div className="md:col-span-3 space-y-2.5">
            <div className="text-[11px] font-black uppercase tracking-wider text-white">
              Навигация
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="transition hover:text-[#00FF87] flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-[#00FF87]" />
                  <span>Поиск и Матрица 2+2</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition hover:text-[#00FF87] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Личный кабинет и история</span>
                </Link>
              </li>
              <li>
                <Link href="/#about" className="transition hover:text-white flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-purple-400" />
                  <span>О проекте и 4 ИИ-агентах</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Колонка 3: Доверие и безопасность */}
          <div className="md:col-span-4 space-y-2.5">
            <div className="text-[11px] font-black uppercase tracking-wider text-white">
              Безопасность и правила
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              wobuy. не принимает плату от продавцов за поднятие в поисковой выдаче. Все выводы агентов формируются на основе открытых данных маркетплейсов и нейросетевого анализа.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-slate-400">
              <Link href="/privacy" className="transition hover:text-white underline underline-offset-4">
                Политика конфиденциальности
              </Link>
              <Link href="/terms" className="transition hover:text-white underline underline-offset-4">
                Пользовательское соглашение
              </Link>
            </div>
          </div>
        </div>

        {/* Нижняя строчка копирайта */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-300">
          <div>
            © 2026 <strong className="text-white">wobuy.</strong> (домен wobuy.ru). Все права защищены.
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00FF87]" />
            <span>Защищено независимым алгоритмом Анти-Фейк</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

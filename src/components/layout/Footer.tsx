"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { NeonDot } from "@/components/brand/WobuyDot";
import { ShieldCheck, Cookie } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const handleOpenCookies = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-cookie-settings"));
    }
  };

  return (
    <footer
      id="global-footer"
      className="relative z-10 w-full border-t border-white/10 bg-[#080A0E] py-8 text-xs text-slate-400"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-6">
        {/* Верхняя линия: Бренд, описание и навигация */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="space-y-2.5 md:col-span-4">
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" />
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-300 font-medium">
                Интеллектуальный поиск товаров
                <NeonDot size="xs" />
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Бесплатный сервис объективного сравнения цен и выявления фейковых скидок на Wildberries и Ozon.
            </p>
            <div className="flex items-center gap-2 pt-0.5 text-[11px] text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Защищено алгоритмом Анти-Фейк 2026</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:col-span-8">
            {/* Навигация */}
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-white uppercase tracking-wider text-[11px]">
                Навигация
              </div>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/search" className="text-slate-400 transition hover:text-[#00FF87]">
                    Поиск по маркетплейсам
                  </Link>
                </li>
                <li>
                  <Link href="/catalog" className="text-slate-400 transition hover:text-[#00FF87]">
                    Разделы каталога
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-slate-400 transition hover:text-[#00FF87]">
                    Личный кабинет
                  </Link>
                </li>
                <li>
                  <Link href="/contacts" className="text-slate-400 transition hover:text-[#00FF87]">
                    Контакты и реквизиты
                  </Link>
                </li>
              </ul>
            </div>

            {/* Юридический блок (152-ФЗ) */}
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-white uppercase tracking-wider text-[11px]">
                Документы (152-ФЗ)
              </div>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/privacy" className="text-slate-400 transition hover:text-white">
                    Политика конфиденциальности
                  </Link>
                </li>
                <li>
                  <Link href="/consent" className="text-slate-400 transition hover:text-white">
                    Согласие на обработку данных
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-400 transition hover:text-white">
                    Пользовательское соглашение
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cookie и индексация */}
            <div className="space-y-2 text-xs col-span-2 sm:col-span-1">
              <div className="font-semibold text-white uppercase tracking-wider text-[11px]">
                Приватность и Карта
              </div>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/legal/cookies" className="text-slate-400 transition hover:text-white">
                    Политика файлов cookie
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleOpenCookies}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-[#00FF87] transition"
                  >
                    <Cookie className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Настройки cookie</span>
                  </button>
                </li>
                <li>
                  <a href="/robots.txt" target="_blank" className="text-slate-500 hover:text-slate-300">
                    robots.txt
                  </a>{" "}
                  •{" "}
                  <a href="/sitemap.xml" target="_blank" className="text-slate-500 hover:text-slate-300">
                    sitemap.xml
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Финальная компактная строка копирайта */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-500 border-t border-white/5 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400">
              © {currentYear}{" "}
              <strong className="font-bold text-white">
                wobuy
                <NeonDot size="xs" />
              </strong>{" "}
              (wobuy.ru). Все права защищены.
            </span>
            <span className="hidden md:inline text-slate-700">•</span>
            <span>Независимый сервис сравнения цен (152-ФЗ / 38-ФЗ)</span>
          </div>

          <div className="text-[10px] text-slate-500">
            100% объективная аналитика без рекламы продавцов
          </div>
        </div>
      </div>
    </footer>
  );
}

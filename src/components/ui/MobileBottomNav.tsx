"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, BarChart2, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isSearch = pathname.startsWith("/search");
  const isDashboard = pathname.startsWith("/dashboard");

  const scrollToAnalytics = () => {
    if (isSearch) {
      const el = document.getElementById("market-analytics");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.location.assign("/search#market-analytics");
  };

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Мобильная навигация"
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-white/10 bg-[#0D0F14]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <Link
        href="/"
        className={`flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${
          isHome ? "text-[#00FF87]" : "text-slate-400 hover:text-white"
        }`}
      >
        <Home className="h-5 w-5" />
        <span>Главная</span>
      </Link>

      <Link
        href="/search"
        className={`flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${
          isSearch ? "text-[#00FF87]" : "text-slate-400 hover:text-white"
        }`}
      >
        <Search className="h-5 w-5" />
        <span>Поиск</span>
      </Link>

      <button
        type="button"
        onClick={scrollToAnalytics}
        className="flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-medium text-slate-400 transition hover:text-white"
      >
        <BarChart2 className="h-5 w-5 text-cyan-400" />
        <span>Аналитика</span>
      </button>

      <Link
        href="/dashboard"
        className={`flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${
          isDashboard ? "text-[#00FF87]" : "text-slate-400 hover:text-white"
        }`}
      >
        <User className="h-5 w-5" />
        <span>Кабинет</span>
      </Link>
    </nav>
  );
}


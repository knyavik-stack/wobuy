"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  LogOut,
  Sliders,
  Users,
  BarChart3,
  ToggleLeft,
  FileText,
  ExternalLink,
  RefreshCw,
  Globe,
} from "lucide-react";
import { AdminUser } from "@/lib/admin/types";

interface AdminHeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  adminUser?: AdminUser | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AdminHeader({
  currentTab,
  onTabChange,
  adminUser,
  onRefresh,
  isRefreshing,
}: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {}
    router.push("/admin/login");
  };

  const navTabs = [
    { id: "analytics", label: "Аналитика", icon: BarChart3 },
    { id: "users", label: "Пользователи", icon: Users },
    { id: "flags", label: "Функции сайта", icon: ToggleLeft },
    { id: "seo", label: "SEO и Индексация", icon: Globe },
    { id: "settings", label: "Настройки и Защита", icon: Sliders },
    { id: "logs", label: "Журнал аудита", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-white font-bold text-lg tracking-tight hover:opacity-90 transition-opacity"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/20">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span>
                wobuy<span className="text-violet-400">.</span>
                <span className="ml-2 inline-flex items-center rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-300 border border-violet-500/20">
                  Admin Panel
                </span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Production 2026 Core</span>
            </div>
          </div>

          {/* Quick Actions & Admin Profile */}
          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50"
                title="Обновить данные"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-violet-400" : ""}`} />
                <span className="hidden sm:inline">Обновить</span>
              </button>
            )}

            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <span>На сайт</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            {/* Admin User Info */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden md:block text-right">
                <div className="text-xs font-medium text-slate-200">
                  {adminUser?.displayName || adminUser?.username || "Администратор"}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">{adminUser?.role || "superadmin"}</div>
              </div>

              <button
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Выйти из кабинета"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-1 -mb-px pb-1 sm:pb-0">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "border-violet-500 text-white bg-violet-500/10 rounded-t-lg"
                    : "border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-violet-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

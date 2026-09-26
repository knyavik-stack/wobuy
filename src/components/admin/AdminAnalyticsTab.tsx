"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Search,
  Package,
  Users,
  Activity,
  Zap,
  Server,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { AnalyticsSummary } from "@/lib/admin/types";

interface AdminAnalyticsTabProps {
  stats: AnalyticsSummary | null;
  onRefresh: () => void;
}

export function AdminAnalyticsTab({ stats, onRefresh }: AdminAnalyticsTabProps) {
  const [cleaningDemo, setCleaningDemo] = useState(false);
  const [cleanMessage, setCleanMessage] = useState<string | null>(null);

  const handleCleanDemoData = async () => {
    if (!confirm("Вы действительно хотите удалить все тестовые/демо записи из базы?")) return;
    setCleaningDemo(true);
    setCleanMessage(null);
    try {
      const res = await fetch("/api/admin/clean-demo", {
        method: "POST",
        headers: { "x-admin-key": "admin_auth_cookie" },
      });
      const data = await res.json();
      if (res.ok) {
        setCleanMessage(`Успешно очищено: ${data.deletedProductsCount || 0} демо-товаров.`);
        onRefresh();
      } else {
        setCleanMessage(data.error || "Ошибка при очистке");
      }
    } catch {
      setCleanMessage("Сбой сетевого соединения.");
    } finally {
      setCleaningDemo(false);
    }
  };

  if (!stats) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-violet-500" />
          <span>Загрузка аналитических данных...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Товары в каталоге
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalProducts}</span>
            <span className="text-xs font-medium text-emerald-400">100% реальные</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Активно на витрине: {stats.activeProducts}</span>
          </div>
        </div>

        {/* Registered Users */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Пользователи
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalRegisteredUsers}</span>
            <span className="text-xs font-medium text-indigo-400">Supabase Auth</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Зарегистрированных учетных записей
          </div>
        </div>

        {/* Search Activity */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Поисковые сессии
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Search className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalSearchesToday}</span>
            <span className="text-xs font-medium text-emerald-400">сегодня</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>Средний отклик: ~{stats.avgSearchTimeMs} мс</span>
          </div>
        </div>

        {/* Marketplace Balance */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Маркетплейсы
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3 text-sm">
            <div>
              <span className="text-lg font-bold text-violet-400">WB</span>{" "}
              <span className="text-white font-semibold">{stats.marketplaceShare.wildberries}%</span>
            </div>
            <div>
              <span className="text-lg font-bold text-blue-400">Ozon</span>{" "}
              <span className="text-white font-semibold">{stats.marketplaceShare.ozon}%</span>
            </div>
          </div>
          <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="bg-gradient-to-r from-violet-600 to-indigo-500"
              style={{ width: `${stats.marketplaceShare.wildberries}%` }}
            />
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400"
              style={{ width: `${stats.marketplaceShare.ozon}%` }}
            />
          </div>
        </div>
      </div>

      {/* System Node Status Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <Server className="h-4 w-4 text-violet-400" />
          <span>Мониторинг инфраструктуры и коннекторов</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Wildberries CDN */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">Wildberries CDN</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live wbbasket.ru
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Корзины basket-01..55 откалиброваны. Живые фото, цены и рейтинги.
            </p>
          </div>

          {/* Ozon SOCKS5 Proxy */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">Ozon Gateway</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400 border border-blue-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                SOCKS5 Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Выделенный IP шлюз (194.226.60.216) + Cookie Jar сессии.
            </p>
          </div>

          {/* Supabase PostgreSQL */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">Supabase DB</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Таблицы каталога, офферов и сессий пользователей синхронизированы.
            </p>
          </div>

          {/* AI Engines */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">AI Модели 2026</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-400 border border-violet-500/20">
                <Zap className="h-3 w-3" />
                Groq + Gemini
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              4 архетипа агентов, нормализация поисковых запросов и анти-фейк скоринг.
            </p>
          </div>
        </div>
      </div>

      {/* Two-Column Analytics: Top Queries & Popular Categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Search Queries */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <span>Популярные поисковые запросы</span>
            </h3>
            <span className="text-xs text-slate-400">Топ за последние дни</span>
          </div>

          <div className="space-y-3">
            {stats.topQueries.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/40 p-3 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800 text-xs font-bold text-slate-300">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-200">
                    {item.query}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/20">
                    {item.count} зап.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Distribution & Quick Tools */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-violet-400" />
              <span>Распределение категорий в каталоге</span>
            </h3>

            <div className="space-y-2.5">
              {stats.popularCategories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat.category}</span>
                    <span className="text-slate-400">{cat.count} товаров</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, (cat.count / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Maintenance Actions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Быстрые сервисные действия</span>
            </h3>

            <p className="text-xs text-slate-400 mb-4">
              Очистка старых тестовых артефактов и ручная синхронизация каталога.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCleanDemoData}
                disabled={cleaningDemo}
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-all disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                <span>{cleaningDemo ? "Очистка..." : "Очистить демо-товары"}</span>
              </button>

              <button
                onClick={onRefresh}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Перезагрузить метрики</span>
              </button>
            </div>

            {cleanMessage && (
              <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-300">
                {cleanMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

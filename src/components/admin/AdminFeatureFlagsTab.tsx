"use client";

import React, { useState, useEffect } from "react";
import {
  ToggleLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Zap,
  Grid,
  Calculator,
  Brain,
  Wrench,
  ShieldCheck,
  Database,
  UserPlus,
} from "lucide-react";
import { FeatureFlags } from "@/lib/admin/types";

export function AdminFeatureFlagsTab() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.featureFlags) {
        setFlags(data.featureFlags);
      }
    } catch {
      setMessage({ type: "error", text: "Не удалось загрузить текущие флаги функций." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleToggle = async (key: keyof FeatureFlags) => {
    if (!flags) return;
    const newValue = !flags[key];

    // Особенное предупреждение для режима техработ
    if (key === "enableMaintenanceMode" && newValue) {
      if (!confirm("ВНИМАНИЕ! Включение режима техобслуживания временно закроет публичный доступ к сайту для всех обычных посетителей. Включить?")) {
        return;
      }
    }

    setSavingKey(key);
    setMessage(null);

    // Оптимистичное обновление
    setFlags({ ...flags, [key]: newValue });

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "feature_flags",
          updates: { [key]: newValue },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Настройка мгновенно сохранена и применена." });
        if (data.featureFlags) setFlags(data.featureFlags);
      } else {
        // Откат при ошибке
        setFlags({ ...flags, [key]: !newValue });
        setMessage({ type: "error", text: data.error || "Ошибка сохранения" });
      }
    } catch {
      setFlags({ ...flags, [key]: !newValue });
      setMessage({ type: "error", text: "Сетевой сбой при сохранении." });
    } finally {
      setSavingKey(null);
    }
  };

  const flagConfigs: Array<{
    key: keyof FeatureFlags;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    danger?: boolean;
  }> = [
    {
      key: "enableWildberriesParser",
      title: "Парсер Wildberries (Живой поиск)",
      description: "Прямой сбор реальных товаров, карточек, цен, остатков и фото с wbbasket.ru.",
      icon: ShoppingBag,
      color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
      key: "enableOzonParser",
      title: "Парсер Ozon (SOCKS5 Прокси)",
      description: "Маршрутизация запросов через приватный SOCKS5 шлюз и сбор Ozon карточек.",
      icon: ShoppingBag,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      key: "enableAiAgents",
      title: "ИИ-Агенты Сравнения (4 Архетипа)",
      description: "Автоматический разбор Перфекционистом, Экономным, Скептиком и Срочным агентами.",
      icon: Zap,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      key: "enableDuelMatrix",
      title: "Матрица 2×2 (Дуэль товаров)",
      description: "Балансировка слотов Чемпионов (Лидер качества, Альтернатива, Эконом, Экспресс).",
      icon: Grid,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      key: "enableTcoCalculator",
      title: "Калькулятор честной стоимости TCO",
      description: "Учет скрытых издержек, платной обратной логистики и срока службы изделия.",
      icon: Calculator,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      key: "enableSemanticSearch",
      title: "Семантический поиск (pgvector Embeddings)",
      description: "Нейросетевой поиск по смыслу и намерениям пользователя при сложных запросах.",
      icon: Brain,
      color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    },
    {
      key: "strictAntiBot",
      title: "Строгий Anti-Bot фильтр сайта",
      description: "Блокировка подозрительных парсеров, проверка заголовков и защита контента wobuy.",
      icon: ShieldCheck,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      key: "enableLiveSearchCache",
      title: "Кэширование выдачи поиска",
      description: "Снижение нагрузки на маркетплейсы за счет 10-минутного in-memory кэширования.",
      icon: Database,
      color: "text-slate-300 bg-slate-800 border-slate-700",
    },
    {
      key: "enableUserRegistrations",
      title: "Регистрация новых пользователей",
      description: "Разрешить новым покупателям создавать учетные записи на платформе.",
      icon: UserPlus,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      key: "enableMaintenanceMode",
      title: "Режим техобслуживания (Maintenance Mode)",
      description: "Временное закрытие витрины для публики с выводом сервисного экрана (админка доступна).",
      icon: Wrench,
      color: "text-red-400 bg-red-500/10 border-red-500/20",
      danger: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ToggleLeft className="h-5 w-5 text-violet-400" />
            <span>Управление функциями и модулями платформы (Feature Flags)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Мгновенное включение и отключение парсеров, ИИ-моделей, кэша и сервисных режимов без перезапуска сервера.
          </p>
        </div>

        <button
          onClick={fetchFlags}
          disabled={loading}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
          <span>Синхронизировать</span>
        </button>
      </div>

      {message && (
        <div
          className={`rounded-xl border p-4 text-xs flex items-center gap-2 ${
            message.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Flags Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {flagConfigs.map((cfg) => {
          const Icon = cfg.icon;
          const isEnabled = flags ? flags[cfg.key] : false;
          const isSaving = savingKey === cfg.key;

          return (
            <div
              key={cfg.key}
              className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                cfg.danger && isEnabled
                  ? "border-red-500/40 bg-red-950/20"
                  : isEnabled
                    ? "border-slate-700 bg-slate-900/80"
                    : "border-slate-800/80 bg-slate-950/40 opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${cfg.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{cfg.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cfg.description}</p>
                  </div>
                </div>

                {/* Custom Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  disabled={loading || isSaving}
                  onClick={() => handleToggle(cfg.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 ${
                    isEnabled
                      ? cfg.danger
                        ? "bg-red-500"
                        : "bg-violet-600"
                      : "bg-slate-750 bg-slate-800"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3 text-[11px]">
                <span className="text-slate-500">Статус:</span>
                <span
                  className={`font-semibold ${
                    isEnabled
                      ? cfg.danger
                        ? "text-red-400"
                        : "text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {isSaving ? "Сохранение..." : isEnabled ? "Активен" : "Выключен"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

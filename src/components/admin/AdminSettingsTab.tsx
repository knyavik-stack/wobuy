"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Shield,
  Zap,
  Globe,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Lock,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { SystemSettings } from "@/lib/admin/types";

export function AdminSettingsTab() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [proxyInfo, setProxyInfo] = useState<{ configured: boolean; maskedUrl?: string; type?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Смена пароля
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok) {
        if (data.systemSettings) setSettings(data.systemSettings);
        if (data.proxyInfo) setProxyInfo(data.proxyInfo);
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка загрузки настроек." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "system_settings",
          updates: settings,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Системные настройки успешно сохранены." });
        if (data.systemSettings) setSettings(data.systemSettings);
      } else {
        setMessage({ type: "error", text: data.error || "Ошибка сохранения" });
      }
    } catch {
      setMessage({ type: "error", text: "Сбой сети при сохранении." });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPwdMessage({ type: "error", text: "Пароль должен содержать минимум 6 символов." });
      return;
    }
    if (newPassword !== passwordConfirm) {
      setPwdMessage({ type: "error", text: "Введенные пароли не совпадают." });
      return;
    }

    setPwdSaving(true);
    setPwdMessage(null);

    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword,
          newUsername: newUsername.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPwdMessage({ type: "success", text: "Пароль администратора успешно обновлен и активен!" });
        setNewPassword("");
        setPasswordConfirm("");
      } else {
        setPwdMessage({ type: "error", text: data.error || "Ошибка обновления пароля" });
      }
    } catch {
      setPwdMessage({ type: "error", text: "Ошибка сети при смене пароля." });
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <RefreshCw className="h-7 w-7 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sliders className="h-5 w-5 text-cyan-400" />
          <span>Системные параметры, лимиты и киберзащита</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Конфигурация Rate Limiting, порогов валидации оригинальности, сетевых таймаутов, смена пароля и управление доступом.
        </p>
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

      {/* Форма смены пароля администратора */}
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-tr from-slate-950 via-slate-900 to-violet-950/20 p-6 backdrop-blur-sm space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-violet-400" />
            <span>Управление паролем и доступом администратора</span>
          </h3>
          <span className="rounded bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300 border border-violet-500/20">
            Безопасное хэширование SHA-256
          </span>
        </div>

        {pwdMessage && (
          <div
            className={`rounded-xl border p-3.5 text-xs flex items-center gap-2 ${
              pwdMessage.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {pwdMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            )}
            <span>{pwdMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Новый логин / email (необязательно)
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Оставьте пустым, чтобы не менять"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Новый пароль администратора *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Подтвердите новый пароль *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Повторите пароль"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwdSaving}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 font-bold text-white shadow-md shadow-violet-600/20 hover:bg-violet-500 transition-all disabled:opacity-50"
            >
              {pwdSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
              <span>Обновить пароль администратора</span>
            </button>
          </div>
        </form>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Rate Limiting & Cybersecurity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-violet-400" />
            <span>Лимиты безопасности (Rate Limiting на IP в минуту)</span>
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Поиск товаров (/api/search)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={settings.rateLimitSearch}
                onChange={(e) => setSettings({ ...settings, rateLimitSearch: parseInt(e.target.value, 10) || 60 })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Запросов/мин на один IP</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Парсеры маркетплейсов (/api/parse/*)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={settings.rateLimitParsers}
                onChange={(e) => setSettings({ ...settings, rateLimitParsers: parseInt(e.target.value, 10) || 40 })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Запросов/мин на один IP</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                AI-агенты и анализ (/api/ai/*)
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={settings.rateLimitAi}
                onChange={(e) => setSettings({ ...settings, rateLimitAi: parseInt(e.target.value, 10) || 30 })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Запросов/мин на один IP</span>
            </div>
          </div>
        </div>

        {/* Anti-Fake & Caching Configuration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span>Параметры алгоритма Анти-Фейк и кэширования</span>
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Минимальный порог оригинальности (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={settings.minAntiFakePercent}
                onChange={(e) => setSettings({ ...settings, minAntiFakePercent: parseInt(e.target.value, 10) || 85 })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Товары с меньшим баллом получают статус «Подозрение»</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                TTL кэша поиска (в минутах)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={settings.cacheTtlMinutes}
                onChange={(e) => setSettings({ ...settings, cacheTtlMinutes: parseInt(e.target.value, 10) || 10 })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Время хранения выдачи в оперативной памяти</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Макс. карточек в выдаче поиска
              </label>
              <input
                type="number"
                min="4"
                max="50"
                value={settings.maxSearchResults}
                onChange={(e) => setSettings({ ...settings, maxSearchResults: parseInt(e.target.value, 10) || 20 })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Количество канонических товаров на странице</span>
            </div>
          </div>
        </div>

        {/* Maintenance Message & Support */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-400" />
            <span>Сервисные сообщения и контакты</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Текст сообщения режима техобслуживания
            </label>
            <textarea
              rows={3}
              value={settings.maintenanceMessage}
              onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white focus:border-violet-500 focus:outline-none leading-relaxed"
              placeholder="Введите текст для посетителей во время техработ..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email службы поддержки
            </label>
            <input
              type="email"
              value={settings.contactSupportEmail}
              onChange={(e) => setSettings({ ...settings, contactSupportEmail: e.target.value })}
              className="w-full sm:w-80 rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>

        {/* SOCKS5 / Proxy Status (Read-Only Isolated Secrets) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-400" />
              <span>Сетевой прокси-шлюз (Изолированные переменные окружения)</span>
            </h3>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-700">
              <Lock className="h-3 w-3 text-amber-400" />
              Secrets Isolated
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Статус конфигурации:</span>
              <span className={`font-semibold ${proxyInfo?.configured ? "text-emerald-400" : "text-amber-400"}`}>
                {proxyInfo?.configured ? "Подключен и активен" : "Не настроен (прямое соединение)"}
              </span>
            </div>
            {proxyInfo?.configured && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Маскированный адрес:</span>
                  <span className="font-mono text-slate-200">{proxyInfo.maskedUrl}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Протокол:</span>
                  <span className="uppercase font-semibold text-blue-400">{proxyInfo.type || "SOCKS5"}</span>
                </div>
              </>
            )}
            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
              Логины, пароли и порты прокси изолированы в переменных окружения (`OZON_PROXY_URL`) и недоступны в браузере.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Сохранение настроек..." : "Сохранить все настройки"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

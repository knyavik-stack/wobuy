"use client";

import React, { useState, useEffect } from "react";
import {
  Scale,
  ShieldCheck,
  Building2,
  Cookie,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { LegalSettings, CookieBannerSettings } from "@/lib/admin/types";
import { DEFAULT_LEGAL_SETTINGS, DEFAULT_COOKIE_BANNER_SETTINGS } from "@/lib/legal/legal-defaults";

export function AdminLegalTab() {
  const [legal, setLegal] = useState<LegalSettings | null>(null);
  const [cookie, setCookie] = useState<CookieBannerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"company" | "privacy" | "consent" | "terms" | "cookie">("company");

  const fetchLegalSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok) {
        setLegal(data.legalSettings || DEFAULT_LEGAL_SETTINGS);
        setCookie(data.cookieSettings || DEFAULT_COOKIE_BANNER_SETTINGS);
      }
    } catch {
      setLegal(DEFAULT_LEGAL_SETTINGS);
      setCookie(DEFAULT_COOKIE_BANNER_SETTINGS);
      setMessage({ type: "error", text: "Ошибка загрузки юридических настроек." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegalSettings();
  }, []);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legal || !cookie) return;

    setSaving(true);
    setMessage(null);

    try {
      const [resLegal, resCookie] = await Promise.all([
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "legal_settings", updates: legal }),
        }),
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "cookie_settings", updates: cookie }),
        }),
      ]);

      if (resLegal.ok && resCookie.ok) {
        setMessage({ type: "success", text: "Юридические данные, документы 152-ФЗ и настройки Cookie успешно сохранены!" });
      } else {
        setMessage({ type: "error", text: "Некоторые настройки не удалось сохранить." });
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка сети при сохранении юридических данных." });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !legal || !cookie) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <RefreshCw className="h-7 w-7 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveAll} className="space-y-6">
      {/* Шапка вкладки */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span>Юридическая база, 152-ФЗ и Управление Cookie</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Реквизиты компании, публичные тексты Политики конфиденциальности, Согласия, Оферты и баннера согласия с куки.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Сохранить изменения</span>
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2.5 rounded-xl p-4 text-xs font-medium ${
            message.type === "success"
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border border-rose-500/20 bg-rose-500/10 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Переключатели разделов документов */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("company")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            activeSubTab === "company"
              ? "bg-slate-800 text-white border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building2 className="h-4 w-4 text-cyan-400" />
          <span>Реквизиты и контакты</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("privacy")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            activeSubTab === "privacy"
              ? "bg-slate-800 text-white border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="h-4 w-4 text-emerald-400" />
          <span>Политика конфиденциальности (152-ФЗ)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("consent")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            activeSubTab === "consent"
              ? "bg-slate-800 text-white border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Согласие на обработку ПД</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("terms")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            activeSubTab === "terms"
              ? "bg-slate-800 text-white border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Scale className="h-4 w-4 text-indigo-400" />
          <span>Пользовательское соглашение / Оферта</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("cookie")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            activeSubTab === "cookie"
              ? "bg-slate-800 text-white border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cookie className="h-4 w-4 text-amber-400" />
          <span>Баннер и политика Cookie</span>
        </button>
      </div>

      {/* 1. Реквизиты и контакты */}
      {activeSubTab === "company" && (
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-bold text-white text-sm">Данные юридического лица и контакты поддержки</h3>
            <Link
              href="/contacts"
              target="_blank"
              className="flex items-center gap-1 text-xs text-[#00FF87] hover:underline"
            >
              <span>Открыть страницу контактов</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Наименование организации</label>
              <input
                type="text"
                value={legal.companyName}
                onChange={(e) => setLegal({ ...legal, companyName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Бренд / Торговое обозначение</label>
              <input
                type="text"
                value={legal.brandName}
                onChange={(e) => setLegal({ ...legal, brandName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">ИНН</label>
              <input
                type="text"
                value={legal.inn}
                onChange={(e) => setLegal({ ...legal, inn: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-cyan-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">ОГРН / ОГРНИП</label>
              <input
                type="text"
                value={legal.ogrn}
                onChange={(e) => setLegal({ ...legal, ogrn: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-cyan-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Юридический адрес</label>
              <input
                type="text"
                value={legal.legalAddress}
                onChange={(e) => setLegal({ ...legal, legalAddress: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">E-mail службы поддержки</label>
              <input
                type="email"
                value={legal.supportEmail}
                onChange={(e) => setLegal({ ...legal, supportEmail: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Телефон горячей линии</label>
              <input
                type="text"
                value={legal.supportPhone}
                onChange={(e) => setLegal({ ...legal, supportPhone: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Дисклеймер независимого агрегатора (отображается в подвале)
              </label>
              <textarea
                rows={3}
                value={legal.partnerDisclaimer}
                onChange={(e) => setLegal({ ...legal, partnerDisclaimer: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-slate-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Уведомление о маркировке рекламы и партнерских ссылках (38-ФЗ)
              </label>
              <textarea
                rows={2}
                value={legal.eridNotice}
                onChange={(e) => setLegal({ ...legal, eridNotice: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-slate-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Политика конфиденциальности (152-ФЗ) */}
      {activeSubTab === "privacy" && (
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-sm">Полный текст Политики конфиденциальности</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Публикуется на странице /privacy</p>
            </div>
            <Link
              href="/privacy"
              target="_blank"
              className="flex items-center gap-1 text-xs text-[#00FF87] hover:underline"
            >
              <span>Посмотреть на сайте</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <textarea
            rows={16}
            value={legal.privacyPolicyText}
            onChange={(e) => setLegal({ ...legal, privacyPolicyText: e.target.value })}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed focus:border-emerald-500 focus:outline-none"
          />
        </div>
      )}

      {/* 3. Согласие на обработку ПД */}
      {activeSubTab === "consent" && (
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-sm">Текст Согласия на обработку персональных данных</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Публикуется на странице /consent и привязывается к формам</p>
            </div>
            <Link
              href="/consent"
              target="_blank"
              className="flex items-center gap-1 text-xs text-[#00FF87] hover:underline"
            >
              <span>Посмотреть на сайте</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <textarea
            rows={14}
            value={legal.consentText}
            onChange={(e) => setLegal({ ...legal, consentText: e.target.value })}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed focus:border-emerald-500 focus:outline-none"
          />
        </div>
      )}

      {/* 4. Пользовательское соглашение */}
      {activeSubTab === "terms" && (
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-sm">Пользовательское соглашение и правила сервиса</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Публикуется на странице /terms</p>
            </div>
            <Link
              href="/terms"
              target="_blank"
              className="flex items-center gap-1 text-xs text-[#00FF87] hover:underline"
            >
              <span>Посмотреть на сайте</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <textarea
            rows={16}
            value={legal.termsOfServiceText}
            onChange={(e) => setLegal({ ...legal, termsOfServiceText: e.target.value })}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed focus:border-emerald-500 focus:outline-none"
          />
        </div>
      )}

      {/* 5. Настройки Cookie баннера */}
      {activeSubTab === "cookie" && (
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-bold text-white text-sm">Всплывающий баннер согласия с Cookie</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cookie.enabled}
                onChange={(e) => setCookie({ ...cookie, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-3 font-semibold text-white">Баннер включен</span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Заголовок баннера</label>
              <input
                type="text"
                value={cookie.bannerTitle}
                onChange={(e) => setCookie({ ...cookie, bannerTitle: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Текст кнопки «Принять»</label>
              <input
                type="text"
                value={cookie.acceptButtonText}
                onChange={(e) => setCookie({ ...cookie, acceptButtonText: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Текст кнопки «Отклонить необязательные»</label>
              <input
                type="text"
                value={cookie.declineButtonText}
                onChange={(e) => setCookie({ ...cookie, declineButtonText: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Текст кнопки «Настроить»</label>
              <input
                type="text"
                value={cookie.customizeButtonText}
                onChange={(e) => setCookie({ ...cookie, customizeButtonText: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Текст сообщения баннера</label>
              <textarea
                rows={3}
                value={cookie.bannerText}
                onChange={(e) => setCookie({ ...cookie, bannerText: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">Текст Политики Cookie (страница /legal/cookies)</span>
              <Link
                href="/legal/cookies"
                target="_blank"
                className="flex items-center gap-1 text-xs text-[#00FF87] hover:underline"
              >
                <span>Открыть /legal/cookies</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
            <textarea
              rows={8}
              value={legal.cookiePolicyText}
              onChange={(e) => setLegal({ ...legal, cookiePolicyText: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </form>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Code,
  FileCode,
  Sparkles,
  ExternalLink,
  Bot,
} from "lucide-react";
import { SeoSettings } from "@/lib/admin/types";

export function AdminSeoTab() {
  const [seo, setSeo] = useState<SeoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState<"google" | "yandex" | "social">("google");

  const fetchSeoSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.seoSettings) {
        setSeo(data.seoSettings);
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка загрузки настроек SEO." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seo) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "seo_settings",
          updates: seo,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Настройки SEO и индексации успешно сохранены и применены на сайте." });
        if (data.seoSettings) setSeo(data.seoSettings);
      } else {
        setMessage({ type: "error", text: data.error || "Ошибка сохранения" });
      }
    } catch {
      setMessage({ type: "error", text: "Сетевой сбой при сохранении SEO-настроек." });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !seo) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <RefreshCw className="h-7 w-7 animate-spin text-violet-500" />
      </div>
    );
  }

  // Расчет индикаторов длины для SEO
  const titleLen = seo.defaultTitle?.length || 0;
  const descLen = seo.defaultDescription?.length || 0;

  const isTitleOptimal = titleLen >= 30 && titleLen <= 65;
  const isDescOptimal = descLen >= 120 && descLen <= 170;

  // Пример Schema.org JSON-LD для предпросмотра
  const sampleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${seo.canonicalBaseUrl}/#webapp`,
        "name": seo.siteName,
        "url": seo.canonicalBaseUrl,
        "applicationCategory": "ShoppingApplication",
        "operatingSystem": "All",
        "description": seo.defaultDescription,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "RUB",
        },
      },
      {
        "@type": "Organization",
        "@id": `${seo.canonicalBaseUrl}/#org`,
        "name": seo.siteName,
        "url": seo.canonicalBaseUrl,
        "logo": `${seo.canonicalBaseUrl}/icon.svg`,
      },
      {
        "@type": "WebSite",
        "@id": `${seo.canonicalBaseUrl}/#website`,
        "url": seo.canonicalBaseUrl,
        "name": seo.siteName,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${seo.canonicalBaseUrl}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              <span>Полноценное управление SEO, индексацией и OpenGraph</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Тонкая настройка мета-тегов, сниппетов поисковых систем (Яндекс, Google), социальных карточек, Schema.org и robots.txt.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <FileCode className="h-3.5 w-3.5 text-cyan-400" />
              <span>robots.txt</span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Code className="h-3.5 w-3.5 text-emerald-400" />
              <span>sitemap.xml</span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>
          </div>
        </div>
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
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Live Previews Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Интерактивный предпросмотр сниппета в реальном времени</h3>
          </div>
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setPreviewMode("google")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                previewMode === "google"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("yandex")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                previewMode === "yandex"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Яндекс
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("social")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                previewMode === "social"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Telegram / OpenGraph
            </button>
          </div>
        </div>

        {/* Preview Container */}
        {previewMode === "google" && (
          <div className="rounded-xl bg-white p-4 font-sans text-left shadow-md max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-[#202124] mb-1">
              <div className="h-4 w-4 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
                w
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-medium text-xs text-[#202124]">{seo.siteName}</span>
                <span className="text-[11px] text-[#4d5156]">{seo.canonicalBaseUrl}</span>
              </div>
            </div>
            <h4 className="text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-1">
              {seo.defaultTitle}
            </h4>
            <p className="text-xs text-[#4d5156] mt-1 leading-relaxed line-clamp-2">
              {seo.defaultDescription}
            </p>
          </div>
        )}

        {previewMode === "yandex" && (
          <div className="rounded-xl bg-[#232426] p-4 font-sans text-left shadow-md max-w-2xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="text-emerald-400 text-xs">{seo.canonicalBaseUrl.replace(/^https?:\/\//, "")}</span>
              <span className="text-slate-500 text-[11px]">› главная</span>
            </div>
            <h4 className="text-base font-semibold text-[#8eb6ff] hover:underline cursor-pointer leading-snug line-clamp-1">
              {seo.defaultTitle}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
              {seo.defaultDescription}
            </p>
          </div>
        )}

        {previewMode === "social" && (
          <div className="rounded-xl border border-slate-700 bg-slate-950 max-w-lg overflow-hidden shadow-lg">
            <div className="h-36 bg-gradient-to-tr from-indigo-950 via-slate-900 to-violet-950 flex flex-col items-center justify-center p-4 text-center border-b border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg mb-2">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-bold text-white tracking-wide">{seo.siteName}</span>
              <span className="text-[10px] text-violet-300">ИИ-поиск и сравнение маркетплейсов</span>
            </div>
            <div className="p-3.5 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {seo.canonicalBaseUrl.replace(/^https?:\/\//, "")}
              </span>
              <h4 className="text-xs font-bold text-slate-100 line-clamp-1">
                {seo.defaultTitle}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {seo.defaultDescription}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Главные мета-теги сайта */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Search className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">1. Основные мета-теги и сниппет главной страницы</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Название сервиса / Бренда
              </label>
              <input
                type="text"
                value={seo.siteName}
                onChange={(e) => setSeo({ ...seo, siteName: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                placeholder="wobuy."
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Используется в `og:site_name`, JSON-LD и заголовках.</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Шаблон заголовка страниц (Title Template)
              </label>
              <input
                type="text"
                value={seo.titleTemplate}
                onChange={(e) => setSeo({ ...seo, titleTemplate: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
                placeholder="%s | wobuy."
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Символ `%s` автоматически заменяется на заголовок раздела или карточки.</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Главный заголовок сайта (Title)
              </label>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isTitleOptimal
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {titleLen} знаков (рекомендуется 30–65)
              </span>
            </div>
            <input
              type="text"
              value={seo.defaultTitle}
              onChange={(e) => setSeo({ ...seo, defaultTitle: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder="wobuy. — Умный поиск и честное сравнение цен на маркетплейсах"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Мета-описание по умолчанию (Description)
              </label>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isDescOptimal
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {descLen} знаков (рекомендуется 120–160)
              </span>
            </div>
            <textarea
              rows={3}
              value={seo.defaultDescription}
              onChange={(e) => setSeo({ ...seo, defaultDescription: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none leading-relaxed"
              placeholder="wobuy. — ИИ-помощник для поиска, сравнения цен и выбора лучших предложений на Wildberries и Ozon..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Ключевые слова (Keywords, через запятую)
            </label>
            <input
              type="text"
              value={seo.siteKeywords}
              onChange={(e) => setSeo({ ...seo, siteKeywords: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder="wobuy, поиск товаров, сравнение цен, wildberries, ozon, честные отзывы"
            />
          </div>
        </div>

        {/* Section 2: Паттерны динамических страниц (Каталог и Карточки товаров) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">2. Паттерны генерации мета-тегов для динамических страниц</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Шаблон Title страниц поиска и каталога
              </label>
              <input
                type="text"
                value={seo.catalogTitlePattern}
                onChange={(e) => setSeo({ ...seo, catalogTitlePattern: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
                placeholder="{query} — купить по выгодной цене | wobuy."
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Доступные переменные: <code className="text-violet-400">{"{query}"}</code>, <code className="text-violet-400">{"{category}"}</code>.</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Шаблон Title карточки товара
              </label>
              <input
                type="text"
                value={seo.productTitlePattern}
                onChange={(e) => setSeo({ ...seo, productTitlePattern: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
                placeholder="{title} — купить по честной цене со скидкой | wobuy."
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Доступные переменные: <code className="text-violet-400">{"{title}"}</code>, <code className="text-violet-400">{"{brand}"}</code>, <code className="text-violet-400">{"{price}"}</code>.</span>
            </div>
          </div>
        </div>

        {/* Section 3: Индексация, Canonical и Верификация вебмастеров */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bot className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">3. Индексация роботами, Canonical URL и Верификация</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Канонический базовый URL (Canonical Origin)
              </label>
              <input
                type="url"
                value={seo.canonicalBaseUrl}
                onChange={(e) => setSeo({ ...seo, canonicalBaseUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                placeholder="https://wobuy.ru"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Директива Robots Indexing
              </label>
              <select
                value={seo.robotsIndexing}
                onChange={(e) => setSeo({ ...seo, robotsIndexing: e.target.value as SeoSettings["robotsIndexing"] })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="index, follow">index, follow (Полная открытая индексация в поиске — Production)</option>
                <option value="noindex, follow">noindex, follow (Не индексировать главную, но переходить по ссылкам)</option>
                <option value="noindex, nofollow">noindex, nofollow (Полный запрет индексации поисковыми роботами)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Яндекс.Вебмастер (Код yandex-verification)
              </label>
              <input
                type="text"
                value={seo.yandexVerification || ""}
                onChange={(e) => setSeo({ ...seo, yandexVerification: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
                placeholder="например: a1b2c3d4e5f6g7h8"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Автоматически добавляется в &lt;meta name=&quot;yandex-verification&quot;&gt;.</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Google Search Console (Код google-site-verification)
              </label>
              <input
                type="text"
                value={seo.googleVerification || ""}
                onChange={(e) => setSeo({ ...seo, googleVerification: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
                placeholder="например: dQw4w9WgXcQ_sampleVerificationCode"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Автоматически добавляется в &lt;meta name=&quot;google-site-verification&quot;&gt;.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/60">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-white block">Динамический Sitemap.xml</span>
                <span className="text-[10px] text-slate-400 block">Автогенерация карты всех товаров и категорий</span>
              </div>
              <input
                type="checkbox"
                checked={seo.sitemapEnabled}
                onChange={(e) => setSeo({ ...seo, sitemapEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-white block">Микроразметка Schema.org (JSON-LD)</span>
                <span className="text-[10px] text-slate-400 block">Разметка WebApplication, Product, Organization</span>
              </div>
              <input
                type="checkbox"
                checked={seo.jsonLdEnabled}
                onChange={(e) => setSeo({ ...seo, jsonLdEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Schema.org JSON-LD Live Preview */}
        {seo.jsonLdEnabled && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">4. Активный Schema.org JSON-LD граф (валидный для Google Rich Results)</h3>
              </div>
              <span className="text-[10px] text-slate-500">Автоматически встраивается в &lt;head&gt;</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
              {JSON.stringify(sampleJsonLd, null, 2)}
            </pre>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? "Сохранение..." : "Сохранить и применить SEO"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

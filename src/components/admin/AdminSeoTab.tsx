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
  ExternalLink,
  Bot,
  ShieldCheck,
} from "lucide-react";
import { SeoSettings } from "@/lib/admin/types";
import { DEFAULT_ROBOTS_SETTINGS } from "@/lib/legal/legal-defaults";

export function AdminSeoTab() {
  const [seo, setSeo] = useState<SeoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState<"google" | "yandex" | "social">("google");
  const [subTab, setSubTab] = useState<"meta" | "robots" | "sitemap" | "webmaster" | "schema">("meta");

  const fetchSeoSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.seoSettings) {
        setSeo({
          ...data.seoSettings,
          robotsSettings: data.seoSettings.robotsSettings || { ...DEFAULT_ROBOTS_SETTINGS },
        });
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
        setMessage({ type: "success", text: "Настройки SEO, robots.txt и индексации успешно применены на сайте." });
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

  const robots = seo.robotsSettings || DEFAULT_ROBOTS_SETTINGS;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Заголовок панели управления SEO */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-400" />
            <span>SEO, Robots.txt, Sitemap.xml и Поисковая оптимизация</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Полный контроль мета-тегов, сниппетов для Яндекса и Google, генерации карты сайта и индексации.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Сохранить и применить</span>
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

      {/* Подвкладки SEO */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setSubTab("meta")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            subTab === "meta"
              ? "bg-slate-800 text-white border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Search className="h-4 w-4 text-cyan-400" />
          <span>Мета-теги & Предпросмотр SERP</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("robots")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            subTab === "robots"
              ? "bg-slate-800 text-white border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Bot className="h-4 w-4 text-emerald-400" />
          <span>robots.txt (Индексация)</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("sitemap")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            subTab === "sitemap"
              ? "bg-slate-800 text-white border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileCode className="h-4 w-4 text-amber-400" />
          <span>sitemap.xml (Карта сайта)</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("webmaster")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            subTab === "webmaster"
              ? "bg-slate-800 text-white border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-rose-400" />
          <span>Яндекс.Вебмастер & Google</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("schema")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            subTab === "schema"
              ? "bg-slate-800 text-white border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Code className="h-4 w-4 text-indigo-400" />
          <span>Schema.org (Микроразметка JSON-LD)</span>
        </button>
      </div>

      {/* 1. Мета-теги и предпросмотр */}
      {subTab === "meta" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Форма мета-тегов */}
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">Основные мета-теги сайта</h3>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">Название сайта (Site Name) *</label>
                  <span className="font-mono text-[11px] text-slate-500">{seo.siteName?.length || 0} симв.</span>
                </div>
                <input
                  type="text"
                  required
                  value={seo.siteName}
                  onChange={(e) => setSeo({ ...seo, siteName: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">Главный Title страницы *</label>
                  <span className={`font-mono text-[11px] ${isTitleOptimal ? "text-emerald-400" : "text-amber-400"}`}>
                    {titleLen}/60 симв. {isTitleOptimal ? "(Оптимально)" : "(Рекомендуется 45-60)"}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={seo.defaultTitle}
                  onChange={(e) => setSeo({ ...seo, defaultTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">Meta Description *</label>
                  <span className={`font-mono text-[11px] ${isDescOptimal ? "text-emerald-400" : "text-amber-400"}`}>
                    {descLen}/160 симв. {isDescOptimal ? "(Оптимально)" : "(Рекомендуется 140-160)"}
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={seo.defaultDescription}
                  onChange={(e) => setSeo({ ...seo, defaultDescription: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ключевые слова (Keywords через запятую)</label>
                <input
                  type="text"
                  value={seo.siteKeywords}
                  onChange={(e) => setSeo({ ...seo, siteKeywords: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-slate-800">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Канонический базовый URL</label>
                  <input
                    type="text"
                    value={seo.canonicalBaseUrl}
                    onChange={(e) => setSeo({ ...seo, canonicalBaseUrl: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Директива Robots (Индексация)</label>
                  <select
                    value={seo.robotsIndexing}
                    onChange={(e) => setSeo({ ...seo, robotsIndexing: e.target.value as SeoSettings["robotsIndexing"] })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="index, follow">index, follow (Полная индексация)</option>
                    <option value="noindex, nofollow">noindex, nofollow (Закрыто от поиска)</option>
                    <option value="noindex, follow">noindex, follow (Ссылки обходить, страницу скрыть)</option>
                  </select>
                </div>
              </div>

              {/* Динамические паттерны заголовков */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="font-bold text-white">Паттерны генерации заголовков страниц (ЧПУ)</h4>
                <div>
                  <label className="block text-slate-400 mb-1">Шаблон карточки товара</label>
                  <input
                    type="text"
                    value={seo.productTitlePattern}
                    onChange={(e) => setSeo({ ...seo, productTitlePattern: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Шаблон страницы поиска и каталога</label>
                  <input
                    type="text"
                    value={seo.catalogTitlePattern}
                    onChange={(e) => setSeo({ ...seo, catalogTitlePattern: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Интерактивный предпросмотр сниппетов */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Интерактивный SERP-предпросмотр</h3>
                <div className="flex gap-1 rounded-lg bg-slate-950 p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("google")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      previewMode === "google" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("yandex")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      previewMode === "yandex" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Яндекс
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("social")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      previewMode === "social" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Соцсети
                  </button>
                </div>
              </div>

              {/* Google Preview */}
              {previewMode === "google" && (
                <div className="rounded-xl border border-slate-200/20 bg-[#202124] p-4 text-left font-sans">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] text-white">
                      w
                    </div>
                    <div className="text-xs text-[#dadce0]">
                      <span className="font-medium text-white">{seo.siteName}</span>
                      <span className="text-[11px] text-[#bdc1c6] block">{seo.canonicalBaseUrl}</span>
                    </div>
                  </div>
                  <h4 className="text-base text-[#8ab4f8] hover:underline cursor-pointer line-clamp-1 leading-snug">
                    {seo.defaultTitle}
                  </h4>
                  <p className="mt-1 text-xs text-[#bdc1c6] line-clamp-2 leading-relaxed">
                    {seo.defaultDescription}
                  </p>
                </div>
              )}

              {/* Yandex Preview */}
              {previewMode === "yandex" && (
                <div className="rounded-xl border border-slate-700 bg-[#161616] p-4 text-left font-sans">
                  <div className="text-[11px] text-[#858585] mb-1 flex items-center gap-1.5">
                    <span className="text-emerald-400">wobuy.ru</span>
                    <span>›</span>
                    <span>поиск товаров</span>
                  </div>
                  <h4 className="text-base font-medium text-[#2d7bf6] hover:underline cursor-pointer line-clamp-1">
                    {seo.defaultTitle}
                  </h4>
                  <p className="mt-1 text-xs text-[#b8b8b8] line-clamp-2 leading-relaxed">
                    {seo.defaultDescription}
                  </p>
                </div>
              )}

              {/* Social Preview */}
              {previewMode === "social" && (
                <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                  <div className="h-32 w-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center border-b border-slate-800">
                    <span className="text-xs font-mono text-cyan-400">wobuy. OpenGraph 1200x630 Preview</span>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500">wobuy.ru</span>
                    <h5 className="text-xs font-bold text-white line-clamp-1">{seo.defaultTitle}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{seo.defaultDescription}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Robots.txt Visual Editor */}
      {subTab === "robots" && (
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-sm">Управление файлом robots.txt</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Настройте пути, закрытые от индексации поисковыми роботами (Яндекс, Google).
              </p>
            </div>
            <a
              href="/robots.txt"
              target="_blank"
              className="flex items-center gap-1 text-xs text-[#00FF87] hover:underline"
            >
              <span>Проверить живой /robots.txt</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Запрещенные пути (Disallow, по одному на строку)
              </label>
              <textarea
                rows={7}
                value={robots.disallowPaths.join("\n")}
                onChange={(e) => {
                  const paths = e.target.value.split("\n").map((p) => p.trim()).filter(Boolean);
                  setSeo({
                    ...seo,
                    robotsSettings: { ...robots, disallowPaths: paths },
                  });
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-rose-300 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Разрешенные пути (Allow, по одному на строку)
              </label>
              <textarea
                rows={7}
                value={robots.allowPaths.join("\n")}
                onChange={(e) => {
                  const paths = e.target.value.split("\n").map((p) => p.trim()).filter(Boolean);
                  setSeo({
                    ...seo,
                    robotsSettings: { ...robots, allowPaths: paths },
                  });
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-emerald-300 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Дополнительные правила для Яндекс.Вебмастера и Clean-param
            </label>
            <textarea
              rows={5}
              value={robots.customRules}
              onChange={(e) => {
                setSeo({
                  ...seo,
                  robotsSettings: { ...robots, customRules: e.target.value },
                });
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-slate-300 text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 3. Sitemap.xml */}
      {subTab === "sitemap" && (
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-sm">Генератор и диагностика sitemap.xml</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Автоматическая карта сайта в соответствии со стандартами sitemaps.org.
              </p>
            </div>
            <a
              href="/sitemap.xml"
              target="_blank"
              className="flex items-center gap-1 text-xs text-[#00FF87] hover:underline"
            >
              <span>Открыть live sitemap.xml</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="text-slate-400 block mb-1">Статус генератора:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Активен (Динамический)</span>
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="text-slate-400 block mb-1">Частота обновления:</span>
              <span className="text-white font-mono font-medium">daily (Ежедневно)</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="text-slate-400 block mb-1">Приоритет главной:</span>
              <span className="text-cyan-400 font-mono font-bold">1.0</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950 p-4 space-y-2">
            <span className="font-semibold text-white block">Инструкция для добавления в Яндекс.Вебмастер:</span>
            <p className="text-slate-400 leading-relaxed">
              1. Перейдите в Яндекс.Вебмастер → раздел «Индексирование» → «Файлы Sitemap».<br />
              2. В поле ввода укажите: <code className="text-[#00FF87]">{seo.canonicalBaseUrl}/sitemap.xml</code>.<br />
              3. Нажмите «Добавить». Проверка структуры и доступности выполнится мгновенно.
            </p>
          </div>
        </div>
      )}

      {/* 4. Яндекс.Вебмастер & Google Search Console */}
      {subTab === "webmaster" && (
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-white text-sm">Подтверждение прав на сайт в Вебмастерах</h3>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Введите проверочный код мета-тега или имя HTML-файла для подтверждения владения доменов в поисковых консолях.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Код подтверждения Яндекс.Вебмастер (yandex-verification)
              </label>
              <input
                type="text"
                value={seo.yandexVerification}
                onChange={(e) => setSeo({ ...seo, yandexVerification: e.target.value })}
                placeholder="Пример: 6f4770144fbbdb88"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-amber-300 focus:border-cyan-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Будет сгенерирован тег &lt;meta name=&quot;yandex-verification&quot; content=&quot;...&quot; /&gt;
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Код подтверждения Google Search Console (google-site-verification)
              </label>
              <input
                type="text"
                value={seo.googleVerification}
                onChange={(e) => setSeo({ ...seo, googleVerification: e.target.value })}
                placeholder="Пример: abcdef123456-XYZ"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Будет сгенерирован тег &lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot; /&gt;
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Schema.org */}
      {subTab === "schema" && (
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-sm">Структурированные данные Schema.org (JSON-LD)</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Генерация микроразметки для расширенных сниппетов (Sitelinks Searchbox, Organization, Product, Offer).
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={seo.jsonLdEnabled}
                onChange={(e) => setSeo({ ...seo, jsonLdEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              <span className="ml-3 font-semibold text-white">JSON-LD включен</span>
            </label>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto">
            <pre>
{`{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "${seo.siteName}",
      "url": "${seo.canonicalBaseUrl}"
    },
    {
      "@type": "Organization",
      "name": "${seo.siteName}",
      "url": "${seo.canonicalBaseUrl}"
    },
    {
      "@type": "WebSite",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "${seo.canonicalBaseUrl}/search?q={search_term_string}"
      }
    }
  ]
}`}
            </pre>
          </div>
        </div>
      )}
    </form>
  );
}

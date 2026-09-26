"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  FileCode,
  ExternalLink,
  Bot,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  Plus,
  Trash2,
  Send,
  Zap,
} from "lucide-react";
import { SeoSettings, FaqItemConfig } from "@/lib/admin/types";
import { DEFAULT_ROBOTS_SETTINGS } from "@/lib/legal/legal-defaults";
import { DEFAULT_FAQ_ITEMS } from "@/lib/seo/faq-defaults";

export function AdminSeoTab() {
  const [seo, setSeo] = useState<SeoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pingingIndexNow, setPingingIndexNow] = useState(false);
  const [indexNowResult, setIndexNowResult] = useState<{
    submittedCount: number;
    results: Array<{ engine: string; status: string }>;
  } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState<"google" | "yandex" | "social">("yandex");
  const [subTab, setSubTab] = useState<
    "meta" | "analytics" | "faq" | "indexing" | "robots" | "sitemap"
  >("meta");

  const fetchSeoSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.seoSettings) {
        setSeo({
          ...data.seoSettings,
          robotsSettings: data.seoSettings.robotsSettings || { ...DEFAULT_ROBOTS_SETTINGS },
          faqItems:
            Array.isArray(data.seoSettings.faqItems) && data.seoSettings.faqItems.length > 0
              ? data.seoSettings.faqItems
              : [...DEFAULT_FAQ_ITEMS],
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
        setMessage({
          type: "success",
          text: "Все настройки SEO, Метрики, FAQ и индексации успешно сохранены и применены.",
        });
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

  const handlePingIndexNow = async () => {
    setPingingIndexNow(true);
    setIndexNowResult(null);
    try {
      const res = await fetch("/api/admin/indexnow", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setIndexNowResult({
          submittedCount: data.submittedCount,
          results: data.results || [],
        });
        setMessage({
          type: "success",
          text: `Отправлено ${data.submittedCount} URL в Яндекс и Bing через протокол IndexNow!`,
        });
      } else {
        setMessage({ type: "error", text: data.error || "Ошибка отправки IndexNow" });
      }
    } catch {
      setMessage({ type: "error", text: "Сбой соединения при отправке IndexNow." });
    } finally {
      setPingingIndexNow(false);
    }
  };

  if (loading || !seo) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <RefreshCw className="h-7 w-7 animate-spin text-violet-500" />
      </div>
    );
  }

  const titleLen = seo.defaultTitle?.length || 0;
  const descLen = seo.defaultDescription?.length || 0;
  const isTitleOptimal = titleLen >= 30 && titleLen <= 65;
  const isDescOptimal = descLen >= 120 && descLen <= 170;

  const robots = seo.robotsSettings || DEFAULT_ROBOTS_SETTINGS;
  const faqList: FaqItemConfig[] = seo.faqItems || DEFAULT_FAQ_ITEMS;

  const addFaqItem = () => {
    const newItem: FaqItemConfig = {
      id: `faq-${Date.now()}`,
      category: "Вопросы по сервису",
      question: "Новый частый вопрос покупателей?",
      answer: "Подробный ответ с ключевыми словами для расширенного сниппета в Яндексе и Google.",
    };
    setSeo({ ...seo, faqItems: [...faqList, newItem] });
  };

  const updateFaqItem = (idx: number, field: keyof FaqItemConfig, value: string) => {
    const updated = [...faqList];
    updated[idx] = { ...updated[idx], [field]: value };
    setSeo({ ...seo, faqItems: updated });
  };

  const removeFaqItem = (idx: number) => {
    const updated = faqList.filter((_, i) => i !== idx);
    setSeo({ ...seo, faqItems: updated });
  };

  // Чек-лист готовности SEO
  const auditChecks = [
    {
      label: "Длина главного Title (30–65 симв.)",
      ok: isTitleOptimal,
      detail: `${titleLen} симв.`,
    },
    {
      label: "Длина Meta Description (120–170 симв.)",
      ok: isDescOptimal,
      detail: `${descLen} симв.`,
    },
    {
      label: "ЧПУ-структура разделов (/catalog/[slug])",
      ok: true,
      detail: "Активна (/catalog/*)",
    },
    {
      label: "FAQ-блок и микроразметка FAQPage (JSON-LD)",
      ok: seo.enableFaqSchema !== false && faqList.length >= 3,
      detail: `${faqList.length} вопр.`,
    },
    {
      label: "Динамический robots.txt (Clean-param Яндекс)",
      ok: Boolean(robots.disallowPaths.length > 0),
      detail: "Настроен",
    },
    {
      label: "Автогенерация карты сайта sitemap.xml",
      ok: Boolean(seo.sitemapEnabled),
      detail: seo.sitemapEnabled ? "Включена" : "Отключена",
    },
    {
      label: "Счетчик Яндекс.Метрики (Вебвизор + E-commerce)",
      ok: Boolean(seo.yandexMetrikaId && seo.yandexMetrikaId.trim().length > 3),
      detail: seo.yandexMetrikaId ? `ID: ${seo.yandexMetrikaId}` : "Ожидает ввода ID",
    },
    {
      label: "Счетчик Google Analytics 4 / GTM",
      ok: Boolean(
        (seo.googleAnalyticsId && seo.googleAnalyticsId.trim()) ||
          (seo.googleTagManagerId && seo.googleTagManagerId.trim()),
      ),
      detail: seo.googleAnalyticsId || seo.googleTagManagerId || "Ожидает ввода ID",
    },
    {
      label: "Верификация Яндекс.Вебмастер / Google Search Console",
      ok: Boolean(seo.yandexVerification || seo.googleVerification),
      detail:
        seo.yandexVerification || seo.googleVerification ? "Код прописан" : "Ожидает код",
    },
    {
      label: "Протокол мгновенного обхода IndexNow (Яндекс & Bing)",
      ok: Boolean(seo.enableIndexNow !== false && seo.indexNowKey),
      detail: "Активен",
    },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Заголовок панели управления SEO */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-400" />
            <span>Центр SEO, Яндекс.Метрики, Google Analytics, FAQ и Индексации</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Полное управление поисковой выдачей, привязкой счетчиков аналитики, блоком FAQ (FAQPage) и мгновенной индексацией.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shrink-0"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Сохранить все настройки</span>
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
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Навигация по разделам SEO */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setSubTab("meta")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
            subTab === "meta"
              ? "bg-slate-800 text-white border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <Search className="h-4 w-4 text-cyan-400" />
          <span>Мета-теги & SERP</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("analytics")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
            subTab === "analytics"
              ? "bg-slate-800 text-white border border-[#00FF87]/40 shadow-sm"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <BarChart3 className="h-4 w-4 text-[#00FF87]" />
          <span>Яндекс.Метрика & Google Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("faq")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
            subTab === "faq"
              ? "bg-slate-800 text-white border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <HelpCircle className="h-4 w-4 text-amber-400" />
          <span>FAQ & Быстрые ответы ({faqList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("indexing")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
            subTab === "indexing"
              ? "bg-slate-800 text-white border border-violet-500/40 shadow-sm"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <Zap className="h-4 w-4 text-violet-400" />
          <span>Вебмастер, IndexNow & Чек-лист</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("robots")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
            subTab === "robots"
              ? "bg-slate-800 text-white border border-emerald-500/40 shadow-sm"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <Bot className="h-4 w-4 text-emerald-400" />
          <span>Robots.txt</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("sitemap")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
            subTab === "sitemap"
              ? "bg-slate-800 text-white border border-blue-500/40 shadow-sm"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <FileCode className="h-4 w-4 text-blue-400" />
          <span>Sitemap.xml & Schema.org</span>
        </button>
      </div>

      {/* 1. Вкладка Мета-теги & SERP */}
      {subTab === "meta" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs lg:col-span-7">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">
              Главные мета-теги и шаблоны генерации заголовков
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Название бренда (siteName)</label>
                <input
                  type="text"
                  value={seo.siteName}
                  onChange={(e) => setSeo({ ...seo, siteName: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Канонический домен (Canonical URL)</label>
                <input
                  type="url"
                  value={seo.canonicalBaseUrl}
                  onChange={(e) => setSeo({ ...seo, canonicalBaseUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">Главный заголовок &lt;title&gt; (до 60–65 симв.)</label>
                <span className={isTitleOptimal ? "text-emerald-400 font-mono" : "text-amber-400 font-mono"}>
                  {titleLen} / 60 симв.
                </span>
              </div>
              <input
                type="text"
                value={seo.defaultTitle}
                onChange={(e) => setSeo({ ...seo, defaultTitle: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">Мета-описание &lt;meta name=&quot;description&quot;&gt; (150–160 симв.)</label>
                <span className={isDescOptimal ? "text-emerald-400 font-mono" : "text-amber-400 font-mono"}>
                  {descLen} / 160 симв.
                </span>
              </div>
              <textarea
                rows={3}
                value={seo.defaultDescription}
                onChange={(e) => setSeo({ ...seo, defaultDescription: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white focus:border-cyan-400 focus:outline-none"
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
                <label className="block font-semibold text-slate-300 mb-1">Шаблон Title для поиска и разделов</label>
                <input
                  type="text"
                  value={seo.catalogTitlePattern}
                  onChange={(e) => setSeo({ ...seo, catalogTitlePattern: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-slate-300 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Шаблон Title для карточки товара</label>
                <input
                  type="text"
                  value={seo.productTitlePattern}
                  onChange={(e) => setSeo({ ...seo, productTitlePattern: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-slate-300 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Предпросмотр сниппета в Яндексе, Google и Соцсетях */}
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs lg:col-span-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white text-sm">Предпросмотр сниппета в выдаче</span>
              <div className="flex gap-1.5">
                {(["yandex", "google", "social"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPreviewMode(m)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize ${
                      previewMode === m ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {m === "yandex" ? "Яндекс" : m === "google" ? "Google" : "TG / VK"}
                  </button>
                ))}
              </div>
            </div>

            {previewMode === "yandex" && (
              <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[#00FF87] font-bold text-[10px]">
                    W
                  </span>
                  <span className="text-slate-200 font-semibold">{seo.siteName}</span>
                  <span>•</span>
                  <span className="text-emerald-400">{seo.canonicalBaseUrl}</span>
                </div>
                <div className="text-base font-bold text-sky-400 hover:underline cursor-pointer leading-snug">
                  {seo.defaultTitle}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{seo.defaultDescription}</p>
                <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-sky-400/90">
                  <span>Каталог разделов</span>•<span>Смартфоны</span>•<span>Ноутбуки</span>•<span>Частые вопросы (FAQ)</span>
                </div>
              </div>
            )}

            {previewMode === "google" && (
              <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5 space-y-2">
                <div className="text-xs text-slate-400">{seo.canonicalBaseUrl}</div>
                <div className="text-base font-semibold text-blue-400 leading-snug">
                  {seo.defaultTitle}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{seo.defaultDescription}</p>
              </div>
            )}

            {previewMode === "social" && (
              <div className="rounded-2xl border border-slate-700 bg-slate-950 overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-emerald-900/50 via-slate-900 to-cyan-900/40 flex items-center justify-center border-b border-slate-800">
                  <span className="text-xl font-black text-white">
                    wobuy<span className="text-[#00FF87]">.</span> OpenGraph Preview
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <div className="text-[10px] uppercase text-cyan-400 font-mono">{seo.canonicalBaseUrl}</div>
                  <div className="text-sm font-bold text-white">{seo.defaultTitle}</div>
                  <p className="text-xs text-slate-400 line-clamp-2">{seo.defaultDescription}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Вкладка Яндекс.Метрика & Google Analytics */}
      {subTab === "analytics" && (
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#00FF87]" />
              <span>Привязка Яндекс.Метрики, Google Analytics 4 и Tag Manager</span>
            </h3>
            <p className="text-slate-400 text-[11px] mt-1">
              Укажите идентификаторы ваших счетчиков. Код аналитики автоматически подключается на все страницы сайта с учетом согласия на cookie (152-ФЗ).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Блок Яндекс.Метрики */}
            <div className="rounded-2xl border border-amber-500/20 bg-slate-950/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-black font-black text-xs">
                    Я
                  </span>
                  <span>Яндекс.Метрика</span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    seo.yandexMetrikaId
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {seo.yandexMetrikaId ? "Подключена" : "Не задан ID"}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Номер счетчика Яндекс.Метрики (ID)
                </label>
                <input
                  type="text"
                  value={seo.yandexMetrikaId || ""}
                  onChange={(e) =>
                    setSeo({ ...seo, yandexMetrikaId: e.target.value.replace(/\D/g, "") })
                  }
                  placeholder="Например: 98451230"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 font-mono text-sm text-amber-300 focus:border-amber-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Создайте счетчик на metrika.yandex.ru для домена wobuy.ru и вставьте 8-значный номер.
                </span>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Вебвизор 2.0, карта скроллинга и аналитика форм</span>
                  <input
                    type="checkbox"
                    checked={seo.yandexMetrikaWebvisor !== false}
                    onChange={(e) => setSeo({ ...seo, yandexMetrikaWebvisor: e.target.checked })}
                    className="h-4 w-4 accent-[#00FF87]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Электронная коммерция (Ecommerce dataLayer)</span>
                  <input
                    type="checkbox"
                    checked={seo.yandexMetrikaEcommerce !== false}
                    onChange={(e) => setSeo({ ...seo, yandexMetrikaEcommerce: e.target.checked })}
                    className="h-4 w-4 accent-[#00FF87]"
                  />
                </label>
              </div>
            </div>

            {/* Блок Google Analytics 4 & GTM */}
            <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500 text-black font-black text-xs">
                    G
                  </span>
                  <span>Google Analytics 4 & Tag Manager</span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    seo.googleAnalyticsId || seo.googleTagManagerId
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {seo.googleAnalyticsId || seo.googleTagManagerId ? "Подключен" : "Не задан ID"}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Идентификатор потока Google Analytics 4 (Measurement ID)
                </label>
                <input
                  type="text"
                  value={seo.googleAnalyticsId || ""}
                  onChange={(e) => setSeo({ ...seo, googleAnalyticsId: e.target.value.trim() })}
                  placeholder="Например: G-8X9Y2Z1ABC"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 font-mono text-sm text-cyan-300 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Контейнер Google Tag Manager (GTM ID, опционально)
                </label>
                <input
                  type="text"
                  value={seo.googleTagManagerId || ""}
                  onChange={(e) => setSeo({ ...seo, googleTagManagerId: e.target.value.trim() })}
                  placeholder="Например: GTM-K7L8M9N"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 font-mono text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Счетчик Top.Mail.Ru / VK Реклама (ID пикселя, опционально)
                </label>
                <input
                  type="text"
                  value={seo.topMailRuId || ""}
                  onChange={(e) => setSeo({ ...seo, topMailRuId: e.target.value.trim() })}
                  placeholder="Например: 3456789"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 font-mono text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Вкладка FAQ & Быстрые ответы в поиске */}
      {subTab === "faq" && (
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-amber-400" />
                <span>Управление блоком FAQ и микроразметкой FAQPage (Schema.org)</span>
              </h3>
              <p className="text-slate-400 text-[11px] mt-1">
                Вопросы и ответы отображаются на главной странице и в каталоге, а также передаются поисковым роботам Яндекса и Google для формирования расширенных сниппетов.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seo.enableFaqSchema !== false}
                  onChange={(e) => setSeo({ ...seo, enableFaqSchema: e.target.checked })}
                  className="h-4 w-4 accent-[#00FF87]"
                />
                <span>Микроразметка FAQPage</span>
              </label>

              <button
                type="button"
                onClick={addFaqItem}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Добавить вопрос</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {faqList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="rounded-lg bg-white/5 px-2.5 py-1 font-mono text-[11px] text-[#00FF87]">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => updateFaqItem(idx, "category", e.target.value)}
                      placeholder="Категория вопроса"
                      className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFaqItem(idx)}
                    className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20 transition"
                    title="Удалить вопрос"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Вопрос (заголовок H3 в FAQ):</label>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => updateFaqItem(idx, "question", e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 font-semibold text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Ответ (acceptedAnswer в Schema.org):</label>
                  <textarea
                    rows={2}
                    value={item.answer}
                    onChange={(e) => updateFaqItem(idx, "answer", e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-slate-200 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Вкладка Вебмастер, IndexNow & Чек-лист готовности */}
      {subTab === "indexing" && (
        <div className="space-y-6">
          {/* Блок подтверждения прав в Яндекс.Вебмастере и Google Search Console */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="font-bold text-white text-sm">
                Подтверждение домена в Яндекс.Вебмастере, Google Search Console и Bing
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Вставьте код из мета-тега подтверждения прав: тег автоматически появится в &lt;head&gt; всех страниц сайта.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Яндекс.Вебмастер (yandex-verification)
                </label>
                <input
                  type="text"
                  value={seo.yandexVerification}
                  onChange={(e) => setSeo({ ...seo, yandexVerification: e.target.value.trim() })}
                  placeholder="Например: 6f4770144fbbdb88"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-amber-300 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Google Search Console (google-site-verification)
                </label>
                <input
                  type="text"
                  value={seo.googleVerification}
                  onChange={(e) => setSeo({ ...seo, googleVerification: e.target.value.trim() })}
                  placeholder="Например: abcdef123456-XYZ"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Bing Webmaster Tools (msvalidate.01)
                </label>
                <input
                  type="text"
                  value={seo.bingVerification || ""}
                  onChange={(e) => setSeo({ ...seo, bingVerification: e.target.value.trim() })}
                  placeholder="Например: 1234567890ABCDEF"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Протокол мгновенной индексации IndexNow */}
          <div className="rounded-2xl border border-violet-500/30 bg-slate-900/70 p-6 text-xs space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#00FF87]" />
                  <span>Мгновенная отправка страниц в поиск (Протокол IndexNow для Яндекса и Bing)</span>
                </h3>
                <p className="text-slate-400 text-[11px] mt-1">
                  Ускоряет первичную индексацию и переобход всех ЧПУ-разделов каталога без ожидания планового визита робота.
                </p>
              </div>

              <button
                type="button"
                disabled={pingingIndexNow}
                onClick={handlePingIndexNow}
                className="flex items-center gap-2 rounded-xl bg-[#00FF87] px-4 py-2.5 text-xs font-bold text-black transition hover:bg-[#00E576] disabled:opacity-50 shrink-0"
              >
                {pingingIndexNow ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Отправить страницы в Яндекс сейчас</span>
              </button>
            </div>

            {indexNowResult && (
              <div className="rounded-xl border border-emerald-500/30 bg-slate-950 p-4 space-y-2">
                <div className="font-bold text-emerald-400">
                  Успешно отправлено URL: {indexNowResult.submittedCount}
                </div>
                <div className="flex flex-wrap gap-3">
                  {indexNowResult.results.map((r, i) => (
                    <span key={i} className="rounded-lg bg-white/5 px-3 py-1 text-slate-300">
                      {r.engine}: <strong className="text-white">{r.status}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Чек-лист полного SEO-аудита */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Диагностика и чек-лист готовности к индексации (10 параметров)</span>
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {auditChecks.map((check, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/70 px-4 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    {check.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    )}
                    <span className="text-slate-200 font-medium">{check.label}</span>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 font-mono text-[10px] ${
                      check.ok ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {check.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Вкладка Robots.txt */}
      {subTab === "robots" && (
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-sm">Конфигуратор файла robots.txt</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Закрытие служебных разделов (админка, API, личный кабинет) и открытие ЧПУ-каталога для краулеров.
              </p>
            </div>
            <a
              href="/robots.txt"
              target="_blank"
              className="flex items-center gap-1 text-xs text-[#00FF87] hover:underline"
            >
              <span>Проверить /robots.txt</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Закрытые от индексации пути (Disallow)
              </label>
              <textarea
                rows={7}
                value={robots.disallowPaths.join("\n")}
                onChange={(e) => {
                  const paths = e.target.value
                    .split("\n")
                    .map((p) => p.trim())
                    .filter(Boolean);
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
                Разрешенные пути (Allow)
              </label>
              <textarea
                rows={7}
                value={robots.allowPaths.join("\n")}
                onChange={(e) => {
                  const paths = e.target.value
                    .split("\n")
                    .map((p) => p.trim())
                    .filter(Boolean);
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
              Дополнительные директивы для Яндекс (Clean-param) и Googlebot
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

      {/* 6. Вкладка Sitemap.xml & Schema.org */}
      {subTab === "sitemap" && (
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-sm">
                Генератор карты сайта sitemap.xml и структурированных данных Schema.org
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Включает главную страницу, ЧПУ-разделы /catalog/[slug], поисковые подборки, карточки товаров и юридические страницы.
              </p>
            </div>
            <a
              href="/sitemap.xml"
              target="_blank"
              className="flex items-center gap-1 text-xs text-[#00FF87] hover:underline"
            >
              <span>Открыть /sitemap.xml</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="text-slate-400 block mb-1">Статус Sitemap.xml:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Активен (Автообновление)</span>
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="text-slate-400 block mb-1">ЧПУ-рубрикатор:</span>
              <a href="/catalog" target="_blank" className="text-cyan-400 font-mono font-bold hover:underline">
                /catalog + /catalog/[slug] →
              </a>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="text-slate-400 block mb-1">Активные схемы JSON-LD:</span>
              <span className="text-white font-mono">
                WebSite, Organization, FAQPage, BreadcrumbList, Product
              </span>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

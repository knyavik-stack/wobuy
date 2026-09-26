"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link2,
} from "lucide-react";
import { SemanticCluster } from "@/lib/admin/types";
import { DEFAULT_SEMANTIC_CLUSTERS } from "@/lib/seo/semantic-core";

export function AdminSemanticCoreTab() {
  const [clusters, setClusters] = useState<SemanticCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedClusterIdx, setSelectedClusterIdx] = useState<number>(0);

  const fetchClusters = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.semanticClusters && data.semanticClusters.length > 0) {
        setClusters(data.semanticClusters);
      } else {
        setClusters(DEFAULT_SEMANTIC_CLUSTERS);
      }
    } catch {
      setClusters(DEFAULT_SEMANTIC_CLUSTERS);
      setMessage({ type: "error", text: "Ошибка загрузки семантического ядра." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "semantic_clusters",
          clusters,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Семантическое ядро и структура перелинковки успешно сохранены!" });
        if (data.semanticClusters) setClusters(data.semanticClusters);
      } else {
        setMessage({ type: "error", text: data.error || "Ошибка сохранения" });
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка сети при сохранении семантического ядра." });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCluster = () => {
    const newCluster: SemanticCluster = {
      id: `cluster_${Date.now()}`,
      category: "Новая категория",
      slug: `new-category-${Date.now()}`,
      h1Title: "Сравнение цен в категории",
      metaDescription: "Сравните цены и выберите лучшие предложения со скидкой на маркетплейсах.",
      keywords: ["купить", "скидки", "ozon", "wildberries"],
      popularQueries: [
        { query: "Популярный товар 1", anchorText: "Купить популярный товар 1 выгодно", priority: 0.9, tags: ["Новинка"] },
      ],
    };
    setClusters([...clusters, newCluster]);
    setSelectedClusterIdx(clusters.length);
  };

  const handleDeleteCluster = (idx: number) => {
    if (clusters.length <= 1) {
      alert("Нельзя удалить последний кластер.");
      return;
    }
    const updated = clusters.filter((_, i) => i !== idx);
    setClusters(updated);
    setSelectedClusterIdx(Math.max(0, idx - 1));
  };

  const handleAddQuery = (clusterIdx: number) => {
    const updated = [...clusters];
    const target = updated[clusterIdx];
    target.popularQueries.push({
      query: "Новый запрос для поиска",
      anchorText: "Сравнить цены на новый товар",
      priority: 0.8,
      tags: ["Хит"],
    });
    setClusters(updated);
  };

  const handleDeleteQuery = (clusterIdx: number, queryIdx: number) => {
    const updated = [...clusters];
    updated[clusterIdx].popularQueries = updated[clusterIdx].popularQueries.filter((_, i) => i !== queryIdx);
    setClusters(updated);
  };

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <RefreshCw className="h-7 w-7 animate-spin text-violet-500" />
      </div>
    );
  }

  const currentCluster = clusters[selectedClusterIdx] || clusters[0];

  return (
    <div className="space-y-6">
      {/* Шапка вкладки */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#00FF87]" />
            <span>Семантическое ядро и внутренняя перелинковка</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Управление тематическими кластерами, поисковыми запросами и анкорными ссылками для SEO-продвижения в Яндексе и Google.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddCluster}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            <Plus className="h-4 w-4 text-[#00FF87]" />
            <span>Добавить категорию</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00FF87] to-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-[#00FF87]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Сохранить ядро</span>
          </button>
        </div>
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

      {/* Основная рабочая область */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Список категорий */}
        <div className="space-y-2 lg:col-span-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Тематические кластеры ({clusters.length})
          </div>
          <div className="space-y-1.5">
            {clusters.map((c, idx) => (
              <button
                key={c.id || idx}
                onClick={() => setSelectedClusterIdx(idx)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left text-xs transition-all ${
                  selectedClusterIdx === idx
                    ? "border border-[#00FF87]/40 bg-slate-800 text-white font-bold shadow-sm"
                    : "border border-transparent bg-slate-900/50 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <div className="truncate">
                  <span className="block truncate">{c.category}</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    {c.popularQueries?.length || 0} анкоров • #{c.slug}
                  </span>
                </div>
                {selectedClusterIdx === idx && (
                  <span className="h-2 w-2 rounded-full bg-[#00FF87]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Редактор выбранного кластера */}
        {currentCluster && (
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-bold text-white text-sm">
                  Редактирование кластера: {currentCluster.category}
                </h3>
                <button
                  type="button"
                  onClick={() => handleDeleteCluster(selectedClusterIdx)}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Удалить категорию</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Название категории *</label>
                  <input
                    type="text"
                    value={currentCluster.category}
                    onChange={(e) => {
                      const updated = [...clusters];
                      updated[selectedClusterIdx].category = e.target.value;
                      setClusters(updated);
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-[#00FF87] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">URL-slug (ЧПУ) *</label>
                  <input
                    type="text"
                    value={currentCluster.slug}
                    onChange={(e) => {
                      const updated = [...clusters];
                      updated[selectedClusterIdx].slug = e.target.value;
                      setClusters(updated);
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-cyan-300 focus:border-[#00FF87] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Главный H1 заголовок для SEO *</label>
                  <input
                    type="text"
                    value={currentCluster.h1Title}
                    onChange={(e) => {
                      const updated = [...clusters];
                      updated[selectedClusterIdx].h1Title = e.target.value;
                      setClusters(updated);
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-[#00FF87] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Meta Description категории</label>
                  <textarea
                    rows={2}
                    value={currentCluster.metaDescription}
                    onChange={(e) => {
                      const updated = [...clusters];
                      updated[selectedClusterIdx].metaDescription = e.target.value;
                      setClusters(updated);
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-[#00FF87] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Ключевые слова через запятую (Search Keywords)
                  </label>
                  <input
                    type="text"
                    value={currentCluster.keywords.join(", ")}
                    onChange={(e) => {
                      const updated = [...clusters];
                      updated[selectedClusterIdx].keywords = e.target.value.split(",").map((k) => k.trim()).filter(Boolean);
                      setClusters(updated);
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-slate-300 focus:border-[#00FF87] focus:outline-none"
                  />
                </div>
              </div>

              {/* Анкоры и целевые поисковые запросы */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <Link2 className="h-4 w-4 text-[#00FF87]" />
                    <span>Поисковые запросы и анкоры перелинковки ({currentCluster.popularQueries.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddQuery(selectedClusterIdx)}
                    className="flex items-center gap-1 text-xs text-[#00FF87] hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Добавить анкор</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {currentCluster.popularQueries.map((queryItem, qIdx) => (
                    <div
                      key={qIdx}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">#{qIdx + 1} Запрос</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuery(selectedClusterIdx, qIdx)}
                          className="text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Поисковый запрос (q=)</label>
                          <input
                            type="text"
                            value={queryItem.query}
                            onChange={(e) => {
                              const updated = [...clusters];
                              updated[selectedClusterIdx].popularQueries[qIdx].query = e.target.value;
                              setClusters(updated);
                            }}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white focus:border-[#00FF87] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Осмысленный анкор ссылки</label>
                          <input
                            type="text"
                            value={queryItem.anchorText}
                            onChange={(e) => {
                              const updated = [...clusters];
                              updated[selectedClusterIdx].popularQueries[qIdx].anchorText = e.target.value;
                              setClusters(updated);
                            }}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white focus:border-[#00FF87] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Теги через запятую</label>
                          <input
                            type="text"
                            value={queryItem.tags?.join(", ") || ""}
                            onChange={(e) => {
                              const updated = [...clusters];
                              updated[selectedClusterIdx].popularQueries[qIdx].tags = e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean);
                              setClusters(updated);
                            }}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-300 focus:border-[#00FF87] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Sitemap Priority (0.1 - 1.0)</label>
                          <input
                            type="number"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={queryItem.priority}
                            onChange={(e) => {
                              const updated = [...clusters];
                              updated[selectedClusterIdx].popularQueries[qIdx].priority = parseFloat(e.target.value) || 0.8;
                              setClusters(updated);
                            }}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-cyan-300 focus:border-[#00FF87] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

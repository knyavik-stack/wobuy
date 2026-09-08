"use client";

import React, { useState } from "react";
import { Bot, CheckCircle2, AlertTriangle, ShieldCheck, Flame } from "lucide-react";
import type { AgentPerspective, AgentDialogueEntry } from "@/lib/ai/analyzer";
import { NeonScoreCircle } from "@/components/ui/NeonScoreCircle";

interface UnifiedAgentsAuditProps {
  perspectives: AgentPerspective[] | undefined;
  dialogue?: AgentDialogueEntry[] | undefined;
  avgScore: number;
  finalVerdict?: string;
  recommendedMarketplace?: string;
}

export function UnifiedAgentsAudit({
  perspectives = [],
  dialogue = [],
  avgScore,
  finalVerdict = "Рекомендовано к покупке",
  recommendedMarketplace = "Ozon",
}: UnifiedAgentsAuditProps) {
  const [activeTab, setActiveTab] = useState<"cards" | "battle">("cards");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Карта цветов неона для каждого типа агента
  const getGlowColor = (index: number): "emerald" | "blue" | "amber" | "purple" => {
    switch (index) {
      case 0:
        return "emerald"; // Перфекционист
      case 1:
        return "blue"; // Экономный
      case 2:
        return "amber"; // Срочный
      case 3:
      default:
        return "purple"; // Скептик
    }
  };

  const getAgentLabel = (index: number): string => {
    switch (index) {
      case 0:
        return "КАЧЕСТВО";
      case 1:
        return "ВЫГОДА";
      case 2:
        return "СКОРОСТЬ";
      case 3:
      default:
        return "ТРАСТ";
    }
  };

  return (
    <section
      id="product-unified-agents-audit"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#12151B] p-5 shadow-2xl backdrop-blur-xl sm:p-7"
    >
      {/* Шапка объединенного блока */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#00FF87]/30 bg-[#00FF87]/15 text-[#00FF87] shadow-[0_0_15px_rgba(0,255,135,0.2)]">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                Мультиагентный аудит 4 ИИ-экспертов wobuy.
              </h2>
              <span className="rounded-full border border-purple-500/30 bg-purple-950/50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-300">
                Конфликт интересов
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Каждый агент отвечает за свою грань сделки: качество сборки, скрытые расходы, логистику и накрутки
            </p>
          </div>
        </div>

        {/* Общий консенсус и переключатель режима */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0D0F14] px-3.5 py-1.5">
            <span className="text-xs text-slate-400">Итоговый балл:</span>
            <strong className="text-sm font-black text-[#00FF87]">{avgScore.toFixed(1)} / 10</strong>
          </div>

          <div className="flex rounded-xl border border-white/10 bg-[#0D0F14] p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("cards")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                activeTab === "cards" ? "bg-[#00FF87] text-black shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Карточки агентов
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("battle")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition ${
                activeTab === "battle" ? "bg-[#00FF87] text-black shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Баттл мнений</span>
            </button>
          </div>
        </div>
      </div>

      {/* РЕЖИМ 1: ДЕТАЛЬНЫЕ КАРТОЧКИ 4 АГЕНТОВ (В КАЖДОЙ ОЦЕНКА В НЕОНОВОМ КРУГЕ) */}
      {activeTab === "cards" && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {perspectives.map((persp, idx) => {
            const glow = getGlowColor(idx);
            const label = getAgentLabel(idx);
            const isSelected = selectedAgent === persp.archetype;

            return (
              <div
                key={idx}
                onClick={() => setSelectedAgent(isSelected ? null : persp.archetype)}
                className={`relative flex flex-col justify-between rounded-3xl border p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  isSelected
                    ? "border-[#00FF87] bg-[#161a22] shadow-[0_0_25px_rgba(0,255,135,0.15)]"
                    : "border-white/10 bg-[#0D0F14] hover:border-white/20"
                }`}
              >
                <div>
                  {/* Шапка агента: Эмодзи + Название + НЕОНОВЫЙ КРУГ ОЦЕНКИ */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{persp.emoji}</span>
                      <div>
                        <div className={`text-xs font-black uppercase tracking-wider ${persp.textColor}`}>
                          {persp.archetype}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400">
                          {persp.verdictTag}
                        </div>
                      </div>
                    </div>

                    {/* Оценка агента в неоновом круге */}
                    <NeonScoreCircle
                      score={persp.score}
                      size="sm"
                      label={label}
                      glowColor={glow}
                    />
                  </div>

                  {/* Тематика и специализация */}
                  <div className="mt-3 text-xs font-black text-white">
                    {persp.title}
                  </div>

                  {/* Аргументы ЗА (Плюсы) */}
                  <div className="mt-3.5 space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      Подтвержденные факты:
                    </div>
                    {persp.pros.map((pro, proIdx) => (
                      <div key={proIdx} className="flex items-start gap-1.5 text-xs text-slate-300 leading-relaxed">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00FF87]" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>

                  {/* Аргументы ПРОТИВ (Минусы / Предостережения) */}
                  {persp.cons && persp.cons.length > 0 && (
                    <div className="mt-3.5 space-y-2 border-t border-white/5 pt-3">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Предостережения эксперта:</span>
                      </div>
                      {persp.cons.map((con, conIdx) => (
                        <div key={conIdx} className="flex items-start gap-1.5 text-xs text-slate-300 leading-relaxed">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{con}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Нижняя сноска */}
                <div className="mt-4 pt-2 text-right">
                  <span className="text-[10px] font-bold text-slate-500">
                    Аудит wobuy. проверен
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* РЕЖИМ 2: БАТТЛ МНЕНИЙ (ДИАЛОГ АГЕНТОВ) */}
      {activeTab === "battle" && (
        <div className="mt-6 space-y-3">
          {dialogue.map((entry, dIdx) => (
            <div
              key={dIdx}
              className="flex items-start gap-3 rounded-2xl border border-white/5 bg-[#0D0F14] p-4 transition hover:border-white/15"
            >
              <span className="text-2xl shrink-0">{entry.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      {entry.name}
                    </span>
                    <span className="text-[10px] text-slate-400">({entry.role})</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-black text-[#00FF87]">
                    <span>Балл:</span>
                    <span>{entry.score.toFixed(1)}</span>
                  </div>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  «{entry.argument}»
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ФИНАЛЬНЫЙ ВЕРДИКТ КОНСЕНСУСА И ПРИЗЫВ К ДЕЙСТВИЮ */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#00FF87]/30 bg-emerald-950/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-[#00FF87] shrink-0" />
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-[#00FF87]">
              Финальный вердикт консенсуса wobuy.
            </div>
            <p className="text-xs text-slate-200 font-medium mt-0.5">
              {finalVerdict} — рекомендация заказывать на площадке <strong>{recommendedMarketplace}</strong>
            </p>
          </div>
        </div>

        <a
          href="#product-duel-section"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#00FF87] px-4 py-2 text-xs font-black text-black shadow-[0_0_15px_rgba(0,255,135,0.3)] transition hover:bg-[#00E576]"
        >
          <span>К выбору маркетплейса</span>
          <span>➔</span>
        </a>
      </div>
    </section>
  );
}

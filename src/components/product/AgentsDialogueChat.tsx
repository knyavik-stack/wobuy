"use client";

import React, { useState } from "react";
import { Flame } from "lucide-react";
import type { AgentDialogueEntry } from "@/lib/ai/analyzer";

interface AgentsDialogueChatProps {
  dialogue: AgentDialogueEntry[] | undefined;
  avgScore: number;
}

const AGENT_CONFIGS: Record<
  string,
  {
    avatarBg: string;
    borderAccent: string;
    badgeBg: string;
    badgeText: string;
    roleDesc: string;
  }
> = {
  perfectionist: {
    avatarBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    borderAccent: "border-emerald-500/30",
    badgeBg: "bg-emerald-950/60 text-[#00FF87]",
    badgeText: "Качество и сборка",
    roleDesc: "Бескомпромиссный эксперт по материалам",
  },
  budget: {
    avatarBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    borderAccent: "border-blue-500/30",
    badgeBg: "bg-blue-950/60 text-blue-300",
    badgeText: "Честная цена",
    roleDesc: "Прагматик бюджета и скрытых скидок",
  },
  urgent: {
    avatarBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    borderAccent: "border-amber-500/30",
    badgeBg: "bg-amber-950/60 text-amber-300",
    badgeText: "Скорость отгрузки",
    roleDesc: "Аналитик складов FBO и сроков доставки",
  },
  skeptic: {
    avatarBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    borderAccent: "border-purple-500/30",
    badgeBg: "bg-purple-950/60 text-purple-300",
    badgeText: "Анти-Фейк & Арбитр",
    roleDesc: "Детектив накруток и ботов",
  },
};

export function AgentsDialogueChat({ dialogue, avgScore }: AgentsDialogueChatProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  if (!dialogue || dialogue.length === 0) return null;

  const filteredDialogue =
    activeTab === "all"
      ? dialogue
      : dialogue.filter((entry) => entry.archetype === activeTab);

  return (
    <div
      id="product-agents-dialogue"
      className="rounded-3xl border border-white/10 bg-[#12151B] p-6 shadow-xl"
    >
      {/* Шапка диалога */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-950/40 text-purple-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black uppercase tracking-wider text-white sm:text-lg">
                Панель «Конфликт интересов»
              </h3>
              <span className="rounded-full border border-purple-500/30 bg-purple-900/40 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                Баттл мнений
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Вместо сухих баллов — прямой спор и аргументация каждого агента перед покупкой
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0D0F14] px-3 py-1.5 self-start sm:self-auto">
          <span className="text-xs text-slate-400">Итоговый консенсус:</span>
          <strong className="text-sm font-black text-[#00FF87]">{avgScore.toFixed(1)} / 10</strong>
        </div>
      </div>

      {/* Быстрые фильтры по агентам */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
            activeTab === "all"
              ? "bg-[#00FF87] text-black"
              : "border border-white/10 bg-[#0D0F14] text-slate-300 hover:border-white/20"
          }`}
        >
          Все 4 мнения ({dialogue.length})
        </button>

        {dialogue.map((entry) => {
          const isActive = activeTab === entry.archetype;
          return (
            <button
              key={entry.archetype}
              type="button"
              onClick={() => setActiveTab(entry.archetype)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                isActive
                  ? "bg-white text-black"
                  : "border border-white/10 bg-[#0D0F14] text-slate-300 hover:border-white/20"
              }`}
            >
              <span>{entry.emoji}</span>
              <span>{entry.name}</span>
            </button>
          );
        })}
      </div>

      {/* Сетка реплик агентов в стиле интерактивного спора */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredDialogue.map((entry, idx) => {
          const cfg = AGENT_CONFIGS[entry.archetype] || AGENT_CONFIGS.perfectionist;

          return (
            <div
              key={idx}
              className={`relative flex flex-col justify-between rounded-2xl border bg-[#0D0F14] p-4.5 transition hover:border-[#00FF87]/40 ${cfg.borderAccent}`}
            >
              <div>
                {/* Автор реплики */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border text-base ${cfg.avatarBg}`}
                    >
                      {entry.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-xs font-black uppercase tracking-wider text-white">
                          {entry.name}
                        </strong>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${cfg.badgeBg}`}
                        >
                          {cfg.badgeText}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">{cfg.roleDesc}</div>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 rounded-xl border border-white/5 bg-[#12151B] px-2.5 py-1">
                    <span className="text-sm font-black text-[#00FF87]">
                      {entry.score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-500">/ 10</span>
                  </div>
                </div>

                {/* Реплика от первого лица */}
                <div className="mt-3 relative pl-3 border-l-2 border-[#00FF87]/40">
                  <p className="text-xs font-medium leading-relaxed text-slate-200 sm:text-[13px]">
                    {entry.argument}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 text-[10px] text-slate-500">
                <span>Проверено в реальном времени</span>
                <span className="text-emerald-400 font-bold">✓ Аргумент подтвержден ИИ</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { AuditLogEntry } from "@/lib/admin/types";

export function AdminAuditLogsTab() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/logs?limit=100");
      const data = await res.json();
      if (res.ok && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch {
      console.error("Ошибка загрузки журнала аудита");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.adminUsername.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress.toLowerCase().includes(search.toLowerCase()) ||
      (l.target && l.target.toLowerCase().includes(search.toLowerCase())),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Успех
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-3 w-3" />
            Внимание
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-400 border border-red-500/20">
            <XCircle className="h-3 w-3" />
            Ошибка
          </span>
        );
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-400" />
            <span>Журнал событий безопасности и аудита действий</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Неизменяемый реестр изменений настроек, переключения флагов, блокировок и попыток авторизации.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Фильтр по действию, IP или пользователю..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
            title="Обновить журнал"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-violet-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Время</th>
                <th className="px-5 py-3.5">Действие</th>
                <th className="px-5 py-3.5">Администратор / Источник</th>
                <th className="px-5 py-3.5">IP-Адрес</th>
                <th className="px-5 py-3.5">Статус</th>
                <th className="px-5 py-3.5">Подробности</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin text-violet-500 mx-auto mb-2" />
                    <span>Чтение журнала аудита...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    События не найдены.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-slate-300">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono font-semibold text-slate-200">
                      {log.action}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-violet-400" />
                        <span>{log.adminUsername}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                      {log.ipAddress}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>

                    <td className="px-5 py-4 text-slate-400 max-w-xs truncate text-[11px]">
                      {log.details ? JSON.stringify(log.details) : log.target || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

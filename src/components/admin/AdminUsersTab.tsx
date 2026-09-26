"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Shield,
  Ban,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Mail,
  Calendar,
  Clock,
} from "lucide-react";

interface AdminUserItem {
  id: string;
  email?: string;
  displayName: string;
  role: string;
  createdAt: string;
  lastSignInAt?: string | null;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  isBanned: boolean;
  bannedUntil?: string;
}

export function AdminUsersTab() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Ошибка загрузки пользователей:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const handleBanToggle = async (user: AdminUserItem) => {
    const actionName = user.isBanned ? "разблокировать" : "заблокировать";
    if (!confirm(`Вы действительно хотите ${actionName} пользователя ${user.email || user.displayName}?`)) {
      return;
    }

    setActionLoading(user.id);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "ban",
          ban: !user.isBanned,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: user.isBanned ? "Пользователь успешно разблокирован." : "Пользователь заблокирован.",
        });
        fetchUsers();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Ошибка при изменении статуса" });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Сбой сети." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (user: AdminUserItem) => {
    if (
      !confirm(
        `ВНИМАНИЕ! Вы собираетесь навсегда удалить пользователя ${user.email} и все его данные (избранное, историю, аналитику). Подтверждаете?`,
      )
    ) {
      return;
    }

    setActionLoading(user.id);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: "success", text: "Пользователь успешно удален." });
        fetchUsers();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Ошибка при удалении" });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Сбой сети." });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Никогда";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            <span>Управление зарегистрированными пользователями</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Просмотр профилей, контроль статуса доступа, блокировка и аудит активности.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по email или имени..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
            title="Обновить список"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-violet-400" : ""}`} />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`rounded-xl border p-4 text-xs flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Пользователь</th>
                <th className="px-5 py-3.5">Статус</th>
                <th className="px-5 py-3.5">Роль</th>
                <th className="px-5 py-3.5">Регистрация</th>
                <th className="px-5 py-3.5">Последний вход</th>
                <th className="px-5 py-3.5 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-violet-500" />
                      <span>Загрузка списка пользователей...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    Пользователи не найдены.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-xs font-bold text-white uppercase">
                          {user.displayName.charAt(0) || user.email?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{user.displayName}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            <span>{user.email || "Без email"}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-400 border border-red-500/20">
                          <Ban className="h-3 w-3" />
                          Заблокирован
                        </span>
                      ) : user.emailConfirmed ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Активен (Verified)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
                          <Clock className="h-3 w-3" />
                          Не подтвержден
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 capitalize">
                        <Shield className="h-3 w-3 text-violet-400" />
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{formatDate(user.lastSignInAt)}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleBanToggle(user)}
                          disabled={actionLoading === user.id}
                          className={`rounded-lg p-1.5 transition-colors ${
                            user.isBanned
                              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
                          }`}
                          title={user.isBanned ? "Разблокировать" : "Заблокировать доступ"}
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={actionLoading === user.id}
                          className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                          title="Удалить пользователя"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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

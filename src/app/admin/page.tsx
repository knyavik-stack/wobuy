"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminAnalyticsTab } from "@/components/admin/AdminAnalyticsTab";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminFeatureFlagsTab } from "@/components/admin/AdminFeatureFlagsTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";
import { AdminAuditLogsTab } from "@/components/admin/AdminAuditLogsTab";
import { AnalyticsSummary, AdminUser } from "@/lib/admin/types";
import { RefreshCw } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("analytics");
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessionAndStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Проверяем авторизацию
      const meRes = await fetch("/api/admin/auth/me");
      if (!meRes.ok) {
        router.push("/admin/login");
        return;
      }
      const meData = await meRes.json();
      if (meData.authenticated && meData.user) {
        setAdminUser(meData.user);
      }

      // 2. Загружаем статистику
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) {
          setStats(statsData.stats);
        }
      }
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessionAndStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-violet-500" />
          <span className="text-xs tracking-wider uppercase font-semibold text-slate-400">
            Инициализация кабинета администратора...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <AdminHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        adminUser={adminUser}
        onRefresh={() => fetchSessionAndStats(true)}
        isRefreshing={refreshing}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {currentTab === "analytics" && (
          <AdminAnalyticsTab
            stats={stats}
            onRefresh={() => fetchSessionAndStats(true)}
          />
        )}

        {currentTab === "users" && <AdminUsersTab />}

        {currentTab === "flags" && <AdminFeatureFlagsTab />}

        {currentTab === "settings" && <AdminSettingsTab />}

        {currentTab === "logs" && <AdminAuditLogsTab />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <span>wobuy. Admin Suite 2026 — Изолированная среда администрирования</span>
      </footer>
    </div>
  );
}

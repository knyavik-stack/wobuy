"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function DashboardLogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoading(false);
      return;
    }

    window.location.assign("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      <span>{loading ? "Выходим…" : "Выйти"}</span>
    </button>
  );
}

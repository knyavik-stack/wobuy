"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Search, Trash2 } from "lucide-react";
import { deleteSavedSearch } from "@/app/dashboard/actions";

type SearchItem = {
  id: string;
  query: string;
  createdAt: string;
};

export function DashboardSearchesList({
  initialSearches,
}: {
  initialSearches: SearchItem[];
}) {
  const [items, setItems] = useState<SearchItem[]>(initialSearches);

  const handleRemove = async (searchId: string) => {
    // Optimistic UI
    setItems((prev) => prev.filter((item) => item.id !== searchId));
    await deleteSavedSearch(searchId);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center">
        <Bookmark className="mx-auto h-6 w-6 text-slate-600" />
        <p className="mt-2 text-xs text-slate-400">
          Сохраняй частые поисковые запросы из выдачи в один клик.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div
          key={item.id}
          className="group flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#171A21] p-3 transition hover:border-[#00FF87]/30 hover:bg-white/[0.04]"
        >
          <Link
            href={`/search?q=${encodeURIComponent(item.query)}`}
            className="flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold text-white transition hover:text-[#00FF87]"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-[#00FF87]" />
            <span className="truncate">{item.query}</span>
          </Link>
          <button
            type="button"
            onClick={() => handleRemove(item.id)}
            aria-label="Удалить поиск"
            className="p-1 text-slate-500 transition hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

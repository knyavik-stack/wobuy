"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { Clock3, Trash2, ShoppingBag } from "lucide-react";
import { deleteHistoryItem } from "@/app/dashboard/actions";

type HistoryItem = {
  id: string;
  productId: string;
  viewedAt: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string | null;
};

export function DashboardHistoryList({
  initialHistory,
}: {
  initialHistory: HistoryItem[];
}) {
  const [items, setItems] = useState<HistoryItem[]>(initialHistory);

  const handleRemove = async (historyId: string) => {
    // Optimistic UI — мгновенно убираем из списка за 0 мс
    setItems((prev) => prev.filter((item) => item.id !== historyId));
    await deleteHistoryItem(historyId);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
        <Clock3 className="mx-auto h-8 w-8 text-slate-600" />
        <h4 className="mt-3 text-sm font-bold text-white">История пока пуста</h4>
        <p className="mt-1 text-xs text-slate-400">
          Открывай карточки товаров — они автоматически сохранятся здесь для быстрого возврата.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#171A21] p-3.5 transition hover:border-[#00FF87]/30 hover:bg-white/[0.02]"
        >
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="text-[#00FF87]">{item.brand}</span>
              <span>{new Date(item.viewedAt).toLocaleDateString("ru-RU")}</span>
            </div>

            <div className="mt-2.5 flex items-center gap-2.5">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-10 w-10 shrink-0 rounded-lg border border-white/10 object-contain bg-[#0D0F14]"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0D0F14]">
                  <ShoppingBag className="h-4 w-4 text-slate-600" />
                </div>
              )}
              <Link
                href={`/product/${item.productId}`}
                className="line-clamp-2 text-xs font-bold text-white transition hover:text-[#00FF87]"
              >
                {item.name}
              </Link>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
            <Link
              href={`/product/${item.productId}`}
              className="text-[11px] font-semibold text-[#00FF87] hover:underline"
            >
              Открыть
            </Link>

            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              aria-label="Удалить из истории"
              className="p-1 text-slate-500 transition hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

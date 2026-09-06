"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ArrowRight, Sparkles, ShoppingBag } from "lucide-react";
import { removeFavorite } from "@/app/dashboard/actions";

type FavoriteItem = {
  productId: string;
  createdAt: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string | null;
  price: number | null;
  aiScore: number;
  antiFakePercent: number;
};

export function DashboardFavoritesList({
  initialFavorites,
}: {
  initialFavorites: FavoriteItem[];
}) {
  const [items, setItems] = useState<FavoriteItem[]>(initialFavorites);

  const handleRemove = async (productId: string) => {
    // Optimistic UI — мгновенное удаление из интерфейса
    setItems((prev) => prev.filter((item) => item.productId !== productId));
    await removeFavorite(productId);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
        <Heart className="mx-auto h-8 w-8 text-slate-600" />
        <h4 className="mt-3 text-sm font-bold text-white">Список избранного пуст</h4>
        <p className="mt-1 text-xs text-slate-400">
          Нажимай на иконку сердечка на карточке любого товара, чтобы следить за динамикой цены и скидками.
        </p>
        <Link
          href="/search"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#00FF87] px-4 py-2 text-xs font-bold text-black transition hover:bg-[#00E576]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Перейти к поиску</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.productId}
          className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#171A21] p-4 transition-all duration-200 hover:border-[#00FF87]/40 hover:shadow-[0_0_20px_rgba(0,255,135,0.06)]"
        >
          <div className="flex gap-3.5">
            {/* Изображение */}
            <Link
              href={`/product/${item.productId}`}
              className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0D0F14] p-1.5"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-contain transition group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <ShoppingBag className="h-6 w-6 text-slate-600" />
              )}
            </Link>

            {/* Описание */}
            <div className="flex flex-1 min-w-0 flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-400">
                  <span className="truncate text-[#00FF87]">{item.brand}</span>
                  <span className="shrink-0">{new Date(item.createdAt).toLocaleDateString("ru-RU")}</span>
                </div>
                <Link
                  href={`/product/${item.productId}`}
                  className="mt-1 line-clamp-2 text-xs font-bold text-white transition hover:text-[#00FF87]"
                >
                  {item.name}
                </Link>
              </div>

              {/* Метрики */}
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-md border border-[#00FF87]/30 bg-[#00FF87]/10 px-1.5 py-0.5 text-[9px] font-black text-[#00FF87]">
                  {item.aiScore.toFixed(1)} AI SCORE
                </span>
                <span className="text-[10px] text-slate-400">
                  Анти-Фейк: {item.antiFakePercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Футер карточки */}
          <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-2.5">
            <Link
              href={`/product/${item.productId}`}
              className="flex items-center gap-1 text-xs font-semibold text-[#00FF87] hover:underline"
            >
              <span>Подробнее</span>
              <ArrowRight className="h-3 w-3" />
            </Link>

            <button
              type="button"
              onClick={() => handleRemove(item.productId)}
              aria-label="Удалить из избранного"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-slate-500 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

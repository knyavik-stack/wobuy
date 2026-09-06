"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/dashboard/actions";

export function ProductFavoriteButton({
  productId,
  initialIsFavorite,
  productMetadata,
}: {
  productId: string;
  initialIsFavorite: boolean;
  productMetadata?: {
    title?: string;
    brand?: string;
    category?: string;
    imageUrl?: string;
  };
}) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI — мгновенная реакция интерфейса
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    setIsPending(true);

    try {
      const res = await toggleFavorite(productId, productMetadata);
      if (res && typeof res.isFavorite === "boolean") {
        setIsFavorite(res.isFavorite);
      }
    } catch {
      // Откат при сетевой ошибке
      setIsFavorite(!nextState);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isFavorite ? "Удалить из избранного" : "В избранное"}
      className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-200 ${
        isFavorite
          ? "border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Heart
        className={`h-4 w-4 transition-transform active:scale-125 ${
          isFavorite ? "fill-red-500 text-red-500 scale-110" : ""
        }`}
      />
      <span>{isFavorite ? "В избранном" : "В избранное"}</span>
    </button>
  );
}

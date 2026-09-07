"use client";

import React from "react";
import Link from "next/link";

interface WobuyAiButtonProps {
  productId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function WobuyAiButton({
  productId,
  size = "md",
  className = "",
  label = "Анализ ИИ",
}: WobuyAiButtonProps) {
  return (
    <Link
      href={`/product/${productId}`}
      title="Открыть полный анализ 4 ИИ-агентов wobuy."
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-emerald-500/40 bg-[#12151B] font-bold text-white shadow-lg transition-all duration-300 hover:border-[#00FF87] hover:bg-[#161a22] hover:shadow-[0_0_20px_rgba(0,255,135,0.35)] ${
        size === "sm"
          ? "h-9 px-3 text-xs"
          : size === "md"
          ? "h-11 px-4 text-xs"
          : "h-12 px-5 text-sm"
      } ${className}`}
    >
      {/* Мягкое неоновое свечение внутри */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF87]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Фирменная надпись wobuy. */}
      <span className="font-black tracking-tight text-white transition-colors group-hover:text-[#00FF87]">
        wobuy<span className="text-[#00FF87]">.</span>
      </span>

      {/* Пульсирующая неоновая зеленая точка #00FF87 */}
      <div className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF87] opacity-75 duration-1000" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00FF87] shadow-[0_0_8px_#00FF87]" />
      </div>

      {label && <span className="text-slate-300 group-hover:text-white">{label}</span>}
    </Link>
  );
}

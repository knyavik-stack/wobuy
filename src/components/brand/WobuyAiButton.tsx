"use client";

import React from "react";
import Link from "next/link";
import { NeonDot } from "@/components/brand/WobuyDot";

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

      {/* Фирменная надпись wobuy. с круглой неоновой точкой */}
      <span className="inline-flex items-baseline font-black tracking-tight text-white transition-colors group-hover:text-[#00FF87]">
        <span>wobuy</span>
        <NeonDot size="xs" />
      </span>

      {label && <span className="text-slate-300 group-hover:text-white">{label}</span>}
    </Link>
  );
}

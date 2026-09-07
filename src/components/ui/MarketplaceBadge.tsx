"use client";

import React from "react";

export type MarketplaceType = "wildberries" | "ozon" | "yandex_market" | "aliexpress" | "megamarket" | string;

interface MarketplaceBadgeProps {
  marketplace: MarketplaceType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function MarketplaceBadge({
  marketplace,
  size = "sm",
  showLabel = true,
  className = "",
}: MarketplaceBadgeProps) {
  const norm = (marketplace || "").toLowerCase().replace(/[\s_-]+/g, "");

  if (norm.includes("wildberries") || norm.includes("wb")) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-[#240c38]/90 font-bold text-white shadow-md backdrop-blur-md ${
          size === "sm"
            ? "px-2 py-0.5 text-[10px]"
            : size === "md"
            ? "px-2.5 py-1 text-xs"
            : "px-3 py-1.5 text-sm"
        } ${className}`}
      >
        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-gradient-to-br from-[#cb11ab] to-[#481173] text-[9px] font-black leading-none text-white shadow-xs">
          W
        </div>
        {showLabel && <span className="tracking-wide">Wildberries</span>}
      </div>
    );
  }

  if (norm.includes("ozon") || norm.includes("оз")) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-[#00173d]/90 font-bold text-white shadow-md backdrop-blur-md ${
          size === "sm"
            ? "px-2 py-0.5 text-[10px]"
            : size === "md"
            ? "px-2.5 py-1 text-xs"
            : "px-3 py-1.5 text-sm"
        } ${className}`}
      >
        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-gradient-to-br from-[#005bff] to-[#0040b3] text-[9px] font-black leading-none text-white shadow-xs">
          O
        </div>
        {showLabel && <span className="tracking-wide text-blue-100">Ozon</span>}
      </div>
    );
  }

  if (norm.includes("yandex") || norm.includes("яндекс") || norm.includes("market") || norm.includes("ym")) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-[#2d1b00]/90 font-bold text-white shadow-md backdrop-blur-md ${
          size === "sm"
            ? "px-2 py-0.5 text-[10px]"
            : size === "md"
            ? "px-2.5 py-1 text-xs"
            : "px-3 py-1.5 text-sm"
        } ${className}`}
      >
        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-[#fc3f1d] text-[9px] font-black leading-none text-white shadow-xs">
          Я
        </div>
        {showLabel && <span className="tracking-wide text-amber-100">Яндекс Маркет</span>}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#161922]/90 font-bold text-slate-200 shadow-md backdrop-blur-md ${
        size === "sm"
          ? "px-2 py-0.5 text-[10px]"
          : size === "md"
          ? "px-2.5 py-1 text-xs"
          : "px-3 py-1.5 text-sm"
      } ${className}`}
    >
      <span className="capitalize">{marketplace}</span>
    </div>
  );
}

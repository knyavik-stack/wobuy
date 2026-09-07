"use client";

import React from "react";
import { motion } from "framer-motion";

export function RadarScanningLogo() {
  return (
    <div
      id="hero-scanning-radar"
      className="relative flex h-[340px] w-full max-w-[380px] items-center justify-center sm:h-[380px]"
    >
      {/* Мягкое фоновое рассеянное свечение */}
      <div className="pointer-events-none absolute h-56 w-56 rounded-full bg-[#00FF87]/15 blur-[90px]" />
      <div className="pointer-events-none absolute h-40 w-40 rounded-full bg-cyan-500/10 blur-[70px]" />

      {/* Внешнее статичное ориентировочное кольцо */}
      <div className="absolute h-72 w-72 rounded-full border border-white/[0.06]" />

      {/* Среднее пунктирное кольцо */}
      <div className="absolute h-56 w-56 rounded-full border border-dashed border-[#00FF87]/20" />

      {/* Вращающееся неоновое кольцо со световым импульсом (по часовой стрелке) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute h-64 w-64 rounded-full border border-transparent"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 240deg, rgba(0, 255, 135, 0.3) 320deg, #00FF87 360deg)",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 1.5px))",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 1.5px))",
        }}
      />

      {/* Второе контр-кольцо для глубины (против часовой стрелки) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="absolute h-48 w-48 rounded-full border border-transparent"
        style={{
          background:
            "conic-gradient(from 180deg, transparent 0deg, transparent 260deg, rgba(0, 229, 255, 0.25) 330deg, #00E5FF 360deg)",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #fff calc(100% - 1px))",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #fff calc(100% - 1px))",
        }}
      />

      {/* Орбитальные световые импульсы-спутники */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute h-64 w-64"
      >
        <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#00FF87] shadow-[0_0_12px_#00FF87]" />
      </motion.div>

      {/* Центральный пьедестал с логотипом */}
      <div className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-[#0A0C10]/95 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition hover:border-[#00FF87]/40">
        <div className="flex items-baseline font-black tracking-tight text-white select-none">
          <span className="text-3xl sm:text-4xl">wobuy</span>
          {/* Пульсирующая сканирующая точка */}
          <span className="relative ml-1 inline-flex">
            <span className="absolute -inset-1 animate-ping rounded-full bg-[#00FF87]/60" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-[#00FF87] shadow-[0_0_14px_#00FF87]" />
          </span>
        </div>
      </div>

      {/* Индикатор активного сканирования под логотипом */}
      <div className="absolute bottom-6 flex items-center gap-2 rounded-full border border-white/5 bg-[#12151B]/80 px-3 py-1 text-[10px] font-semibold text-slate-400 backdrop-blur-md">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00FF87]" />
        <span>ИИ-сканер маркетплейсов 24/7</span>
      </div>
    </div>
  );
}

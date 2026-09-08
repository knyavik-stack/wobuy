"use client";

import React from "react";

interface NeonScoreCircleProps {
  score: number;
  maxScore?: number;
  size?: "xs" | "sm" | "md" | "lg";
  label?: string;
  glowColor?: "emerald" | "purple" | "blue" | "amber";
  className?: string;
}

export function NeonScoreCircle({
  score,
  maxScore = 10,
  size = "md",
  label,
  glowColor = "emerald",
  className = "",
}: NeonScoreCircleProps) {
  const clamped = Math.min(maxScore, Math.max(0, score));
  const progress = clamped / maxScore;

  // Конфигурация размеров
  const dimensions = {
    xs: { svgSize: 40, radius: 15, stroke: 3.5, font: "text-[11px]", labelFont: "text-[7px]" },
    sm: { svgSize: 52, radius: 20, stroke: 4, font: "text-xs font-black", labelFont: "text-[8px]" },
    md: { svgSize: 68, radius: 26, stroke: 5, font: "text-base font-black", labelFont: "text-[9px]" },
    lg: { svgSize: 88, radius: 35, stroke: 6, font: "text-2xl font-black", labelFont: "text-[9px]" },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - progress * circumference;

  // Цвета неона
  const colorMap = {
    emerald: {
      stroke: "#00FF87",
      glow: "drop-shadow(0 0 7px rgba(0, 255, 135, 0.7))",
      border: "border-[#00FF87]/30",
      bg: "bg-[#00FF87]/10",
      text: "text-[#00FF87]",
    },
    purple: {
      stroke: "#C084FC",
      glow: "drop-shadow(0 0 7px rgba(192, 132, 252, 0.7))",
      border: "border-purple-500/30",
      bg: "bg-purple-950/30",
      text: "text-purple-300",
    },
    blue: {
      stroke: "#60A5FA",
      glow: "drop-shadow(0 0 7px rgba(96, 165, 250, 0.7))",
      border: "border-blue-500/30",
      bg: "bg-blue-950/30",
      text: "text-blue-300",
    },
    amber: {
      stroke: "#FBBF24",
      glow: "drop-shadow(0 0 7px rgba(251, 191, 36, 0.7))",
      border: "border-amber-500/30",
      bg: "bg-amber-950/30",
      text: "text-amber-300",
    },
  }[glowColor];

  const center = dimensions.svgSize / 2;

  return (
    <div className={`relative inline-flex shrink-0 flex-col items-center justify-center ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: dimensions.svgSize, height: dimensions.svgSize }}
      >
        <svg
          className="h-full w-full -rotate-90 transform"
          viewBox={`0 0 ${dimensions.svgSize} ${dimensions.svgSize}`}
        >
          {/* Фоновый круг */}
          <circle
            cx={center}
            cy={center}
            r={dimensions.radius}
            className="stroke-white/10"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          {/* Неоновая дуга прогресса */}
          <circle
            cx={center}
            cy={center}
            r={dimensions.radius}
            stroke={colorMap.stroke}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ filter: colorMap.glow }}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Цифра внутри */}
        <div className="absolute flex flex-col items-center justify-center text-center leading-none">
          <span className={`text-white ${dimensions.font} tracking-tight font-black`}>
            {score.toFixed(1)}
          </span>
          {label && (
            <span className={`font-black uppercase tracking-wider ${dimensions.labelFont} ${colorMap.text} mt-0.5`}>
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

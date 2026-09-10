import React from "react";

interface NeonDotProps {
  className?: string;
  animated?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero" | "auto";
}

const SIZE_PRESETS = {
  xs: "w-1 h-1 mb-0.5 ml-0.5",
  sm: "w-1.5 h-1.5 mb-0.5 ml-0.5",
  md: "w-2 h-2 mb-1 ml-0.5",
  lg: "w-2.5 h-2.5 mb-1 ml-1",
  xl: "w-3 h-3 mb-1.5 ml-1",
  hero: "w-3.5 h-3.5 sm:w-4 sm:h-4 mb-1.5 ml-1 sm:ml-1.5",
  auto: "w-[0.22em] h-[0.22em] mb-[0.05em] ml-[0.06em]",
};

/**
 * Фирменная круглая неоновая светящаяся точка бренда wobuy. с мерцанием как в верхнем меню
 */
export function NeonDot({
  className = "",
  animated = true,
  size = "auto",
}: NeonDotProps) {
  const sizeClass = SIZE_PRESETS[size] || SIZE_PRESETS.auto;

  return (
    <span className="relative inline-flex items-baseline select-none align-baseline shrink-0">
      <span className="relative inline-flex items-center justify-center">
        {animated && (
          <span
            aria-hidden="true"
            className={`absolute -inset-[0.15em] animate-ping rounded-full bg-[#00FF87]/60 opacity-75 duration-1000 ${sizeClass}`}
          />
        )}
        <span
          aria-hidden="true"
          className={`relative inline-block shrink-0 rounded-full bg-[#00FF87] shadow-[0_0_10px_#00FF87] ${sizeClass} ${className}`}
        />
      </span>
    </span>
  );
}

/**
 * Фирменное написание бренда wobuy. с неоновой круглой светящейся точкой
 */
export function WobuyWord({
  className = "",
  dotClassName = "",
  animated = true,
  size = "auto",
}: {
  className?: string;
  dotClassName?: string;
  animated?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero" | "auto";
}) {
  return (
    <span className={`inline-flex items-baseline font-black tracking-tight whitespace-nowrap ${className}`}>
      <span>wobuy</span>
      <NeonDot className={dotClassName} animated={animated} size={size} />
    </span>
  );
}

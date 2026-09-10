import React from "react";

interface WobuyWordProps {
  className?: string;
  dotClassName?: string;
}

/**
 * Фирменное написание бренда wobuy. с неоновой светящейся точкой
 */
export function WobuyWord({ className = "", dotClassName = "" }: WobuyWordProps) {
  return (
    <span className={`inline-flex items-baseline font-black tracking-tight ${className}`}>
      <span>wobuy</span>
      <span
        aria-hidden="true"
        className={`text-[#00FF87] drop-shadow-[0_0_8px_#00FF87] select-none ${dotClassName}`}
      >
        .
      </span>
    </span>
  );
}

/**
 * Неоновая светящаяся точка для использования внутри JSX-заголовков после слова wobuy
 */
export function NeonDot({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`text-[#00FF87] drop-shadow-[0_0_8px_#00FF87] font-black select-none ${className}`}
    >
      .
    </span>
  );
}

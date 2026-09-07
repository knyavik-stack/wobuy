"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Play } from "lucide-react";
import { MarketplaceBadge } from "../ui/MarketplaceBadge";

interface ProductGalleryProps {
  images: string[];
  title: string;
  marketplace?: string;
  videoUrl?: string;
  className?: string;
  isCompact?: boolean;
}

export function ProductGallery({
  images = [],
  title,
  marketplace,
  videoUrl,
  className = "",
  isCompact = false,
}: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const validImages = images.filter((img) => img && typeof img === "string" && img.startsWith("http"));
  const galleryImages = validImages.length > 0 ? validImages : [];
  const activeImage = galleryImages[currentIndex] || "";

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVideoPlaying(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVideoPlaying(false);
    setCurrentIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVideoPlaying(false);
    setCurrentIndex(index);
  };

  if (isCompact) {
    return (
      <div className={`group/gallery relative flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl bg-[#0D0F14] sm:h-40 sm:w-40 sm:shrink-0 ${className}`}>
        {/* Фотография */}
        {activeImage ? (
          <img
            src={activeImage}
            alt={title}
            className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover/gallery:scale-105"
            loading="lazy"
          />
        ) : (
          <Sparkles className="h-10 w-10 text-slate-700" />
        )}

        {/* Логотип маркетплейса в левом верхнем углу */}
        {marketplace && (
          <div className="absolute left-2 top-2 z-10">
            <MarketplaceBadge marketplace={marketplace} size="sm" showLabel={false} />
          </div>
        )}

        {/* Стрелки переключения если картинок несколько */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Предыдущее фото"
              className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover/gallery:opacity-100"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Следующее фото"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover/gallery:opacity-100"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Точки пагинации */}
            <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/50 px-1.5 py-0.5 backdrop-blur-xs">
              {galleryImages.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all ${
                    currentIndex === idx ? "w-3 bg-[#00FF87]" : "w-1 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Большой галерейный вид для детальной карточки
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Основное большое изображение / видео */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#12151B] p-4 shadow-2xl">
        {isVideoPlaying && videoUrl ? (
          <div className="h-full w-full">
            <iframe
              src={videoUrl}
              title={`Видеообзор ${title}`}
              className="h-full w-full rounded-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : activeImage ? (
          <img
            src={activeImage}
            alt={title}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <Sparkles className="h-16 w-16 text-slate-700" />
        )}

        {/* Маркетплейс логотип в левом верхнем углу */}
        {marketplace && (
          <div className="absolute left-4 top-4 z-10">
            <MarketplaceBadge marketplace={marketplace} size="md" showLabel={true} />
          </div>
        )}

        {/* Навигационные стрелки */}
        {galleryImages.length > 1 && !isVideoPlaying && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Предыдущее фото"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-2 text-white shadow-lg backdrop-blur-md transition hover:scale-110 hover:bg-black/90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Следующее фото"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-2 text-white shadow-lg backdrop-blur-md transition hover:scale-110 hover:bg-black/90"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Горизонтальная лента миниатюр */}
      {(galleryImages.length > 1 || videoUrl) && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {videoUrl && (
            <button
              type="button"
              onClick={() => setIsVideoPlaying(true)}
              className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-black/40 p-1 transition ${
                isVideoPlaying
                  ? "border-[#00FF87] ring-2 ring-[#00FF87]/50"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00FF87] text-black">
                <Play className="ml-0.5 h-3.5 w-3.5 fill-black" />
              </div>
              <span className="absolute bottom-1 text-[9px] font-bold text-white">Видео</span>
            </button>
          )}

          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleThumbnailClick(e, idx)}
              className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-[#0D0F14] p-1 transition ${
                !isVideoPlaying && currentIndex === idx
                  ? "border-[#00FF87] ring-2 ring-[#00FF87]/50"
                  : "border-white/10 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`${title} - фото ${idx + 1}`}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

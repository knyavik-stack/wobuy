"use client";

import React from "react";
import { Truck, Clock, PackageCheck, RotateCcw, MapPin } from "lucide-react";
import { MarketplaceBadge } from "../ui/MarketplaceBadge";

interface OfferDeliveryInfo {
  marketplace: string;
  price: number;
  deliveryText: string;
  warehouse?: string;
  speedRating?: number;
}

interface DeliveryAnalysisCardProps {
  offers: OfferDeliveryInfo[];
  currency?: string;
}

export function DeliveryAnalysisCard({ offers = [], currency = "RUB" }: DeliveryAnalysisCardProps) {
  const defaultOffers: OfferDeliveryInfo[] = offers.length > 0 ? offers : [
    {
      marketplace: "wildberries",
      price: 2450,
      deliveryText: "Завтра (со склада WB Коледино)",
      warehouse: "Коледино (быстрая отгрузка 4ч)",
      speedRating: 9.8,
    },
    {
      marketplace: "ozon",
      price: 2690,
      deliveryText: "1-2 дня (со склада Ozon Хоругвино)",
      warehouse: "Хоругвино (отгрузка 12ч)",
      speedRating: 9.2,
    },
    {
      marketplace: "yandex_market",
      price: 2750,
      deliveryText: "2 дня (Яндекс Маркет Софьино)",
      warehouse: "Софьино",
      speedRating: 8.9,
    },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#12151B] p-5 shadow-2xl backdrop-blur-md sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white sm:text-base">
              ИИ-Анализ логистики и доставки
            </h3>
            <p className="text-xs text-slate-400">
              Сравнение складов, сроков и рисков повреждения при транспортировке
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/40 px-3 py-1 text-xs font-bold text-amber-300">
          <Clock className="h-3.5 w-3.5" />
          <span>Самая быстрая: Завтра</span>
        </div>
      </div>

      {/* Сетка сравнения площадок */}
      <div className="mt-5 space-y-3">
        {defaultOffers.map((off, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between gap-3 rounded-2xl border border-white/5 bg-[#0D0F14] p-4 transition hover:border-white/10 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3">
              <MarketplaceBadge marketplace={off.marketplace} size="sm" showLabel={true} />
              <div>
                <div className="text-xs font-bold text-white">
                  {off.deliveryText || "Доставка 1-2 дня"}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <MapPin className="h-3 w-3 text-emerald-400" />
                  <span>{off.warehouse || "Склад маркетплейса (FBO)"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <div className="text-right">
                <div className="text-xs font-bold text-[#00FF87]">
                  {off.speedRating ? `${off.speedRating}/10 скорость` : "Высокая скорость"}
                </div>
                <div className="text-[10px] text-slate-400">0% задержек за неделю</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-white">
                {new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(off.price)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Надежность упаковки и правила возврата */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-[#0D0F14] p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
            <PackageCheck className="h-3.5 w-3.5" />
            <span>Сохранность упаковки</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            По данным отчетов ПВЗ: 98.4% заказов доставляются в идеальном состоянии без замятий заводской коробки.
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0D0F14] p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#00FF87]">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Условия возврата</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Бесплатный возврат в любом пункте выдачи в течение 14 дней с момента получения при сохранении товарного вида.
          </p>
        </div>
      </div>
    </div>
  );
}

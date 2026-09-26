"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, Check, Settings, X } from "lucide-react";
import { CookieBannerSettings } from "@/lib/admin/types";

interface CookieConsentBannerProps {
  initialSettings?: CookieBannerSettings;
}

export function CookieConsentBanner({ initialSettings }: CookieConsentBannerProps) {
  const [settings] = useState<CookieBannerSettings>(
    initialSettings || {
      enabled: true,
      bannerTitle: "Мы используем cookie",
      bannerText:
        "wobuy использует файлы cookie и метаданные для обеспечения стабильной работы сервиса, защиты от спам-ботов, персонализации поисковых запросов и честного сравнения цен на маркетплейсах.",
      acceptButtonText: "Принять все",
      declineButtonText: "Только обязательные",
      customizeButtonText: "Настроить параметры",
      allowDecline: true,
    },
  );

  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    // Проверяем сохраненное согласие
    try {
      const storedConsent = localStorage.getItem("wobuy_cookie_consent_v1");
      if (!storedConsent && settings.enabled) {
        // Небольшая задержка перед показом для плавности
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Игнорируем в случае блокировки localStorage
    }
  }, [settings.enabled]);

  // Глобальный слушатель для открытия настроек cookie из футера
  useEffect(() => {
    const handleOpenCookies = () => {
      setModalOpen(true);
      setVisible(true);
    };

    window.addEventListener("open-cookie-settings", handleOpenCookies);
    return () => window.removeEventListener("open-cookie-settings", handleOpenCookies);
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem("wobuy_cookie_consent_v1", JSON.stringify(consent));
    } catch {}
    setVisible(false);
    setModalOpen(false);
  };

  const handleDeclineOptional = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem("wobuy_cookie_consent_v1", JSON.stringify(consent));
    } catch {}
    setVisible(false);
    setModalOpen(false);
  };

  const handleSaveCustom = () => {
    const consent = {
      ...preferences,
      necessary: true,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem("wobuy_cookie_consent_v1", JSON.stringify(consent));
    } catch {}
    setVisible(false);
    setModalOpen(false);
  };

  if (!visible || !settings.enabled) return null;

  return (
    <>
      {/* Нижняя всплывающая плашка */}
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-5xl animate-fade-in-up">
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900/95 p-5 shadow-2xl shadow-black/80 backdrop-blur-xl md:p-6">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 text-[#00FF87] border border-emerald-500/30">
                <Cookie className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm md:text-base">
                    {settings.bannerTitle}
                  </h3>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    152-ФЗ РФ
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300 max-w-3xl">
                  {settings.bannerText}{" "}
                  <Link
                    href="/legal/cookies"
                    className="text-[#00FF87] underline hover:text-emerald-300 transition-colors"
                  >
                    Подробнее о файлах cookie
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>{settings.customizeButtonText}</span>
              </button>

              {settings.allowDecline && (
                <button
                  type="button"
                  onClick={handleDeclineOptional}
                  className="rounded-xl border border-white/10 bg-slate-800/50 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                >
                  {settings.declineButtonText}
                </button>
              )}

              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00FF87] to-cyan-400 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-[#00FF87]/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <Check className="h-4 w-4" />
                <span>{settings.acceptButtonText}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно детальной настройки категорий cookie */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#13161C] p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Cookie className="h-5 w-5 text-[#00FF87]" />
                <h3 className="font-bold text-base text-white">Параметры использования cookie</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Обязательные */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Обязательные технические cookie</span>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    Всегда активны
                  </span>
                </div>
                <p className="mt-1.5 text-slate-400">
                  Необходимы для авторизации, защиты от спам-ботов, безопасности сессий и работы основного функционала сайта.
                </p>
              </div>

              {/* Аналитические */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">Аналитические метрики</div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00FF87]"></div>
                  </label>
                </div>
                <p className="mt-1.5 text-slate-400">
                  Позволяют измерять скорость загрузки страниц и улучшать качество поисковых ответов без сбора персональных данных.
                </p>
              </div>

              {/* Маркетинговые */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">Персонализация и партнерские скидки</div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00FF87]"></div>
                  </label>
                </div>
                <p className="mt-1.5 text-slate-400">
                  Используются для сохранения истории сравнений и показа актуальных скидок маркетплейсов.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={handleDeclineOptional}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                Отклонить необязательные
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="rounded-xl bg-[#00FF87] px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110"
              >
                Сохранить выбор
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

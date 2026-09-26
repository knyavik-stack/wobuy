"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function ContactsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    consent: true,
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      setStatus({
        type: "error",
        text: "Пожалуйста, подтвердите согласие на обработку персональных данных.",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // Имитация отправки в тикет-систему
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus({
        type: "success",
        text: "Ваше обращение успешно отправлено в службу поддержки wobuy. Мы ответим на указанный e-mail в течение 24 часов.",
      });
      setFormData({ name: "", email: "", subject: "", message: "", consent: true });
    } catch {
      setStatus({ type: "error", text: "Ошибка отправки обращения. Пожалуйста, повторите позже." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D0F14] px-4 py-12 text-slate-100 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00FF87] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>На главную</span>
          </Link>
          <span className="text-xs text-slate-400">Служба заботы о клиентах</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-white md:text-4xl">Контакты и реквизиты</h1>
          <p className="text-sm text-slate-400">
            Свяжитесь с нами по любым вопросам работы поискового сервиса, алгоритмов Анти-Фейк или партнерских интеграций.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Левая колонка: Реквизиты и контакты */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-[#13161C] p-6 shadow-xl space-y-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#00FF87]" />
                <span>Юридические данные</span>
              </h2>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Организация:</span>
                    <span>ООО «ВОБАЙ ТЕХНОЛОДЖИС»</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Юридический адрес:</span>
                    <span>119021, г. Москва, ул. Тимура Фрунзе, д. 11, стр. 1</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  <div>
                    <span className="text-slate-500 block">ИНН:</span>
                    <span className="font-mono text-white font-medium">7701234567</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ОГРН:</span>
                    <span className="font-mono text-white font-medium">1247700987654</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#13161C] p-6 shadow-xl space-y-4 text-xs">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-cyan-400" />
                <span>Каналы связи</span>
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[#00FF87]" />
                  <a href="mailto:support@wobuy.ru" className="text-slate-200 hover:text-[#00FF87]">
                    support@wobuy.ru
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-cyan-400" />
                  <a href="tel:+78005553535" className="text-slate-200 hover:text-cyan-300">
                    8 (800) 555-35-35 (Бесплатно по РФ)
                  </a>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>Ежедневно с 09:00 до 21:00 (МСК)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка: Форма обратной связи */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-[#13161C] p-6 shadow-xl md:p-8">
              <h2 className="text-lg font-bold text-white mb-2">Написать в службу поддержки</h2>
              <p className="text-xs text-slate-400 mb-6">
                Заполните форму, и мы свяжемся с вами в течение рабочего дня.
              </p>

              {status && (
                <div
                  className={`mb-6 flex items-start gap-3 rounded-2xl p-4 text-xs ${
                    status.type === "success"
                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border border-rose-500/20 bg-rose-500/10 text-rose-300"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
                  )}
                  <span>{status.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-medium text-slate-300">Ваше имя *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Иван Иванов"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:border-[#00FF87] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-medium text-slate-300">Электронная почта *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ivan@example.com"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:border-[#00FF87] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-medium text-slate-300">Тема обращения</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Вопрос по поиску / партнерство / ошибка на сайте"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:border-[#00FF87] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-medium text-slate-300">Текст сообщения *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Опишите ваш вопрос или предложение..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:border-[#00FF87] focus:outline-none"
                  />
                </div>

                {/* Обязательный юридический чекбокс (152-ФЗ) */}
                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="consent-check"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-[#00FF87] focus:ring-[#00FF87]"
                  />
                  <label htmlFor="consent-check" className="text-[11px] leading-relaxed text-slate-400">
                    Я подтверждаю свое{" "}
                    <Link href="/consent" target="_blank" className="text-[#00FF87] underline hover:text-emerald-300">
                      Согласие на обработку персональных данных
                    </Link>{" "}
                    и ознакомлен с{" "}
                    <Link href="/privacy" target="_blank" className="text-[#00FF87] underline hover:text-emerald-300">
                      Политикой конфиденциальности (152-ФЗ)
                    </Link>
                    .
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00FF87] to-cyan-400 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-[#00FF87]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? "Отправка..." : "Отправить сообщение"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

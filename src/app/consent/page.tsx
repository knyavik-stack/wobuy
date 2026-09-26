import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import { getLegalSettings, getSeoSettings } from "@/lib/admin/settings-store";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoSettings();
  const canonicalUrl = seo.canonicalBaseUrl || "https://wobuy.ru";
  return {
    title: "Согласие на обработку персональных данных | wobuy.",
    description: "Форма согласия на обработку персональных данных пользователей сервиса wobuy в соответствии со ст. 9 Федерального закона № 152-ФЗ.",
    alternates: {
      canonical: `${canonicalUrl}/consent`,
    },
  };
}

export default function ConsentPage() {
  const legal = getLegalSettings();

  return (
    <main className="min-h-screen bg-[#0D0F14] px-4 py-12 text-slate-100 md:px-8">
      <article className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-[#13161C] p-6 shadow-2xl md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00FF87] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Вернуться на главную</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>152-ФЗ Статья 9</span>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Юридически значимый документ</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white md:text-3xl">
            Согласие на обработку персональных данных
          </h1>
          <p className="text-xs text-slate-400">
            Предоставляется оператору: <strong className="text-white">{legal.companyName}</strong> (ИНН: {legal.inn}, ОГРН: {legal.ogrn})
          </p>
        </div>

        {/* Текст согласия */}
        <div className="mt-8 rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-xs leading-relaxed text-slate-300 md:text-sm whitespace-pre-line">
          {legal.consentText}
        </div>

        {/* Дополнительные ссылки */}
        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6 text-xs text-slate-400">
          <Link href="/privacy" className="text-[#00FF87] hover:underline">
            Политика конфиденциальности →
          </Link>
          <Link href="/terms" className="text-[#00FF87] hover:underline">
            Пользовательское соглашение →
          </Link>
          <Link href="/legal/cookies" className="text-[#00FF87] hover:underline">
            Политика Cookie →
          </Link>
          <Link href="/contacts" className="text-[#00FF87] hover:underline">
            Контакты оператора →
          </Link>
        </div>
      </article>
    </main>
  );
}

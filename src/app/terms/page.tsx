import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0D0F14] px-4 py-10 text-slate-100 md:px-8">
      <article className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#13161C] p-6 md:p-10">
        <Link href="/" className="text-sm font-semibold text-[#00FF87] hover:underline">
          ← На главную
        </Link>
        <h1 className="mt-8 text-3xl font-extrabold text-white">Условия использования</h1>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          Демонстрационная версия документа для тестового окружения. Финальные условия будут
          опубликованы перед запуском публичного сервиса.
        </p>
        <section className="mt-8 space-y-6 text-sm leading-7 text-slate-300">
          <div>
            <h2 className="font-bold text-white">1. Назначение сервиса</h2>
            <p>
              wobuy. помогает сравнивать предложения товаров и формировать рекомендации. В
              демо-режиме данные не являются коммерческими предложениями.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-white">2. Демонстрационные данные</h2>
            <p>
              Товары, цены, рейтинги, сроки доставки и предложения используются для проверки
              пользовательского интерфейса и механики. Перед подключением реальных источников они
              будут заменены актуальными данными.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-white">3. Внешние площадки</h2>
            <p>
              Переход по ссылке предложения ведёт на внешний сайт. Условия покупки, наличие и
              итоговая цена определяются соответствующей площадкой.
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}

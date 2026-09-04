import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0D0F14] px-4 py-10 text-slate-100 md:px-8">
      <article className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#13161C] p-6 md:p-10">
        <Link href="/" className="text-sm font-semibold text-[#00FF87] hover:underline">← На главную</Link>
        <h1 className="mt-8 text-3xl font-extrabold text-white">Политика обработки персональных данных</h1>
        <p className="mt-4 text-sm leading-7 text-slate-400">Демонстрационная версия документа для тестового окружения. Перед публичным запуском текст будет приведён в соответствие с фактическими процессами обработки данных и требованиями законодательства.</p>
        <section className="mt-8 space-y-6 text-sm leading-7 text-slate-300">
          <div><h2 className="font-bold text-white">1. Какие данные используются</h2><p>Для авторизации может использоваться адрес электронной почты. Данные каталога не являются персональными данными пользователя.</p></div>
          <div><h2 className="font-bold text-white">2. Цель обработки</h2><p>Данные используются для создания аккаунта, авторизации и предоставления функций личного кабинета.</p></div>
          <div><h2 className="font-bold text-white">3. Безопасность</h2><p>Аутентификация выполняется через Supabase Auth. Секретные ключи не передаются клиенту.</p></div>
          <div><h2 className="font-bold text-white">4. Демо-режим</h2><p>Товары и предложения в текущем окружении являются демонстрационными и используются исключительно для отладки интерфейса и механики.</p></div>
        </section>
      </article>
    </main>
  );
}

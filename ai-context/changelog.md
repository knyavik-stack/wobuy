# Changelog

## 2026-09-04
- Создан базовый каркас WOBuy на Next.js 15 с App Router.
- Добавлены TypeScript, Tailwind CSS, ESLint и Prettier.
- Добавлена чистая структура `src/app`, `src/components`, `src/lib`, `public`.
- Добавлен `README.md` с названием WOBuy и доменом wobuy.ru.
- В `package.json` задано имя `wobuy`.
- Проверено наличие полного набора документов `/ai-context/`.
- Секреты, токены и API-ключи не добавлялись.

## Supabase Auth
- Подключены официальные `@supabase/ssr` 0.12.5 и `@supabase/supabase-js` 2.115.0.
- Добавлены browser/server-клиенты Supabase для Next.js App Router.
- Добавлен `src/middleware.ts` для безопасного обновления cookie-сессии через `auth.getClaims()`.
- Подготовлены маршруты `/login` и `/register`.
- Добавлен `.env.example` только с `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Добавлена базовая документация `supabase/README.md` по RLS и будущим миграциям.
- Минимальная версия Node.js обновлена до `22.0.0`, поскольку актуальный Supabase SDK больше не поддерживает Node.js 20.
- Не добавлялись Service Role Key, токены или другие секреты.

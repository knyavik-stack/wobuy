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
- Добавлен `src/middleware.ts` для обновления и проверки cookie-сессии через `auth.getClaims()`.
- `/login` реализован через email/password `signInWithPassword`.
- `/register` реализован через email/password `signUp` с подтверждением email.
- Добавлен `/auth/callback` для PKCE/OAuth code exchange и email `token_hash`.
- Добавлен защищённый `/dashboard`.
- Добавлены минимальные shadcn/ui-компоненты `Button`, `Input`, `Card` и необходимые UI-зависимости.
- Ошибки auth переводятся на русский без раскрытия лишних деталей.
- `.env.example` содержит только `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- RLS остаётся обязательным слоем для будущих пользовательских таблиц.
- Service Role Key, токены и другие секреты в репозиторий не добавлялись.

## Проверка
- Реальные `npm install`, `build`, `lint` и `typecheck` через удалённый GitHub-коннектор не выполнялись; CI-сборка не заявляется как подтверждённая.

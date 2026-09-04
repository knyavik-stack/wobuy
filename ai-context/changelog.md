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

## Восстановление пароля и выход

- Добавлена кнопка «Выйти» на `/dashboard` через `supabase.auth.signOut()`.
- Добавлена публичная страница `/forgot-password` с `resetPasswordForEmail()`.
- Добавлена публичная страница `/reset-password` для установки нового пароля через `updateUser()` после успешного recovery-сеанса.
- Recovery использует PKCE через существующий `/auth/callback`; callback принимает только фиксированный внутренний переход `/reset-password`.
- Ответ восстановления пароля нейтрален и не раскрывает, существует ли аккаунт с указанным email.
- Middleware по-прежнему защищает `/dashboard`, а auth-страницы остаются публичными.
- Добавлены русские состояния загрузки, успеха и ошибок для logout/recovery.

## CI/CD

- Добавлен `.github/workflows/ci.yml` для автоматической проверки push и pull request в `main`.
- CI выполняет `npm install`, `npm run typecheck`, `npm run lint`, `npm run format:check` и `npm run build` на Node.js 22.
- Используется `npm install`, поскольку `package-lock.json` в репозитории отсутствует; `npm ci` и npm cache не используются.
- Первый запуск пустого workflow завершился ошибкой; после этого workflow заменён на полноценную CI-конфигурацию.
- Исправлена конфигурация ESLint 9 для Next.js и TypeScript.
- Исправлен `postcss.config.mjs` под текущую конфигурацию Tailwind.
- Исправлены форматирование и структура 26 файлов, выявленных `prettier --check`.
- Одноразовый workflow автоматического форматирования удалён после успешного применения изменений.

## Проверка

- Проект не запускается локально; целевой способ проверки — Vercel Preview.
- После форматирования требуется финальный полный GitHub Actions CI-запуск на актуальном коммите.
- Для email confirmation и password recovery необходимо настроить Supabase Auth URL Configuration и Email provider.

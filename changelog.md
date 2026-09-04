# Changelog

## 2026-09-04

- Создан базовый каркас на Next.js 15 с App Router.
- Подключены TypeScript, Tailwind CSS, ESLint и Prettier.
- Реализован Supabase Auth: login, register, email confirmation, callback, logout, recovery и reset password.
- Настроен GitHub Actions CI: typecheck, lint, format:check и production build.
- Исправлены конфигурации ESLint/PostCSS и форматирование проекта.
- CI run #60 после интеграции auth V2 прошёл полностью успешно.
- `package.json` закреплён на Node.js `22.x` для стабильного Vercel build.
- Временные workflow для автоматических исправлений удалены.
- `/forgot-password` и `/reset-password` переведены на единый утверждённый V2-дизайн.
- V2-восстановление использует реальный Supabase Auth без имитаций и `console.log`.
- Удалены старые `maket/LoginPage.tsx`, `maket/RegisterPage.tsx`, `maket/ResetPasswordPage.tsx`.
- Добавлены совместимые маршруты `/auth/login`, `/auth/register`, `/auth/reset` для устранения 404 на старых ссылках.
- Landing-дизайн из `maket/` интегрирован в приложение.

## Далее

- Завершить проверку Vercel Preview после последнего auth V2 build.
- Реализовать поиск и страницу результатов по `maket/SearchResults.tsx`.
- Подготовить схему данных и основу сбора данных.
- Подключить AI-агентов после появления нормализованного слоя данных.

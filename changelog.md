# Changelog

## 2026-09-04

- Создан базовый каркас на Next.js 15 с App Router.
- Подключены TypeScript, Tailwind CSS, ESLint и Prettier.
- Реализован безопасный Supabase Auth: login, register, email confirmation, callback, logout, recovery и reset password.
- Настроен GitHub Actions CI: typecheck, lint, format:check и production build.
- Исправлены конфигурации ESLint/PostCSS и форматирование 26 файлов.
- Финальный CI run #28 прошёл успешно; Vercel deployment актуального коммита успешен.
- Дизайн из `maket/HeroSection.tsx` интегрирован в `src/components/landing/hero-section.tsx`.
- Главная `/` подключена к новому landing-дизайну, вход ведёт на `/login`.

## Далее

- Проверка полного auth flow на Vercel Preview.
- Поиск и страница результатов по `maket/SearchResults.tsx`.
- Основа сбора данных и AI-агентов.

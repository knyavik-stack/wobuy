# Changelog

## 2026-09-04

- Создан базовый каркас на Next.js 15 с App Router.
- Подключены TypeScript, Tailwind CSS, ESLint и Prettier.
- Реализован безопасный Supabase Auth: login, register, email confirmation, callback, logout, recovery и reset password.
- Добавлены SSR-клиенты Supabase и middleware-защита `/dashboard`.
- Секреты и Service Role Key в репозиторий не добавлялись.
- Настроен GitHub Actions CI: install, typecheck, lint, format:check и production build.
- Исправлены конфигурации ESLint/PostCSS и форматирование 26 файлов.
- Финальный CI run #28 прошёл полностью успешно; Vercel deployment актуального коммита также успешен.
- Добавлен `framer-motion`.
- Дизайн `maket/HeroSection.tsx` интегрирован в `src/components/landing/hero-section.tsx`.
- Главная страница `/` переведена на новый landing-дизайн; кнопка входа связана с `/login`.

## Следующий этап

- Проверить полный auth flow на Vercel Preview.
- Реализовать поиск и страницу результатов по `maket/SearchResults.tsx`.
- Подготовить архитектуру сбора данных и AI-агентов.

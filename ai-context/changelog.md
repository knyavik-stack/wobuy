# Changelog

## 2026-09-04

- Создан базовый каркас на Next.js 15 с App Router.
- Подключены TypeScript, Tailwind CSS, ESLint и Prettier.
- Реализован безопасный Supabase Auth: login, register, email confirmation, callback, logout, recovery и reset password.
- Добавлены SSR-клиенты Supabase и middleware-защита `/dashboard`.
- Секреты и Service Role Key в репозиторий не добавлялись.
- Настроен GitHub Actions CI: install, typecheck, lint, format:check и production build.
- CI run #60 после auth V2 — полностью успешен.
- Node.js для проекта закреплён на `22.x`, чтобы убрать автоматический major upgrade на Vercel.
- Временные workflow автоматизации исправлений удалены.
- `/forgot-password` и `/reset-password` переведены на V2-дизайн и реальный Supabase recovery flow.
- Удалены старые макетные auth-страницы первой версии.
- Добавлены совместимые auth redirect-маршруты для устранения 404.
- Landing-дизайн интегрирован в приложение.
- CI run #73 успешно завершён.
- Проверены RLS-политики и индексы каталога `products`/`product_offers`.
- `/search` подключён к реальному Supabase-каталогу через серверный provider.
- Добавлен V2 UI результатов поиска без mock-товаров.
- Каталог на момент проверки пуст: 0 товаров и 0 предложений.

## Следующий этап

- Реализовать ingestion из маркетплейсов в `product_offers`.
- Добавить нормализацию и дедупликацию.
- Подготовить полнотекстовое и семантическое ранжирование.
- После появления нормализованных данных подключить AI-агентов.

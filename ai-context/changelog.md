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
- Введён единый `npm run format` и постоянный GitHub Actions workflow для автоматического форматирования всех поддерживаемых файлов.
- CI run #82 после внедрения автоматического форматирования успешно завершён.
- Добавлена таблица `ingestion_runs` для аудита загрузок каталога.
- Добавлены уникальные ключи для дедупликации `products` и `product_offers`.
- Развёрнута защищённая Supabase Edge Function `ingest-catalog` с JWT и валидацией входных данных.

## Следующий этап

- Подключить реальные адаптеры Ozon, Wildberries и Яндекс Маркета после получения API-доступов.
- Завершить нормализацию, дедупликацию и стратегию повторных загрузок.
- Подготовить полнотекстовое и семантическое ранжирование.
- После появления нормализованных данных подключить pgvector и AI-агентов.

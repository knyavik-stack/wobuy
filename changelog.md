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
- CI run #73 успешно завершён: TypeScript, ESLint, Prettier и production build зелёные.
- Vercel Preview последнего стабильного состояния имеет статус `success`.
- Проверена схема каталога `products` + `product_offers`: RLS разрешает чтение только активных сущностей, необходимые индексы присутствуют.
- `/search` переведён с моков на серверный поиск реальных данных Supabase.
- Добавлен `src/lib/catalog/search.ts` для поиска по названию, бренду, категории и описанию.
- Добавлен `maket/SearchResults-v2.tsx`; при пустом каталоге отображается честное состояние без демонстрационных товаров.
- На момент интеграции каталог содержит 0 товаров и 0 предложений.
- Исправлена системная проблема форматирования: `npm run format` теперь является единым write-командным скриптом Prettier.
- CI перед проверками автоматически форматирует проект, а затем повторно выполняет `format:check`.
- Добавлен постоянный `.github/workflows/format.yml`, который форматирует `main` и автоматически коммитит исправления.
- CI run #82 после внедрения автоматического форматирования успешно завершён.
- В Supabase добавлен `ingestion_runs` для аудита загрузок каталога.
- Для `product_offers` добавлена уникальность `marketplace + external_id`.
- Для `products` добавлен уникальный `canonical_key` для дедупликации товара по названию и бренду.
- Развёрнута защищённая Edge Function `ingest-catalog` с JWT-проверкой, валидацией и безопасным upsert в каталог.

## Далее

- Подключить реальные API-адаптеры Ozon, Wildberries и Яндекс Маркета после получения доступа/ключей.
- Завершить нормализацию атрибутов и обработку ошибок/повторных загрузок.
- Затем подключить полнотекстовое/семантическое ранжирование и pgvector.
- После появления данных расширить V2-выдачу фильтрами, AI Score, историей цен и анализом отзывов.

# Changelog

## 2026-09-26 (Дополнение 18: Точный поиск моделей, адаптивный каталог, FAQPage, Яндекс.Метрика, GA4 и IndexNow)

- **Точность поиска по моделям и брендам (`src/lib/catalog/search.ts`, `src/lib/ai/ai-search-engine.ts`, `src/lib/parsers/wb-client.ts`, `src/lib/parsers/deduplicator.ts`)**:
  - Исправлена проблема ложных срабатываний по одиночным словам (`Ultra`, `Pro`, `Смартфон`): теперь при поиске `Samsung Galaxy S24 Ultra` возвращаются исключительно реальные смартфоны Samsung Galaxy S24 Ultra (256/512 ГБ в разных цветах с CDN Wildberries).
  - Добавлен фильтр `isUnwantedAccessory`, автоматически отсекающий чехлы, защитные стекла и пленки, когда пользователь ищет само устройство.
  - Исправлено наследование реальной цены от соседних цветовых вариаций (`card.colors`), если у конкретного цвета отсутствует архив `price-history.json`.
- **Адаптация блока «Каталог умного поиска» (`src/components/seo/SemanticHubs.tsx`)**:
  - Табы разделов и карточки закладок адаптированы через `grid` и `flex-wrap` со счетчиками подборок — все разделы и закладки помещаются на любых разрешениях экрана без обрезки.
- **Оптимизация подвала сайта (`src/components/layout/Footer.tsx`)**:
  - Удален громоздкий блок уведомления об агрегаторе, занимавший лишнее место; информация вынесена в компактную нижнюю строку копирайта.
- **Блок FAQ (`FAQPage` Schema.org) и управление в Админке (`src/components/seo/FaqSection.tsx`, `src/lib/seo/faq-defaults.ts`)**:
  - Добавлен интерактивный аккордеон частых вопросов на главную страницу и страницу каталога с автоматической генерацией JSON-LD `FAQPage` для расширенных сниппетов в Яндексе и Google.
  - В раздел «SEO & Индексация» админки добавлен визуальный редактор вопросов и ответов FAQ.
- **Привязка Яндекс.Метрики, Google Analytics 4, GTM, ЧПУ `/catalog/[slug]` и IndexNow (`src/components/admin/AdminSeoTab.tsx`, `src/components/seo/AnalyticsScripts.tsx`, `src/app/catalog/[slug]/page.tsx`, `src/app/api/admin/indexnow/route.ts`)**:
  - Добавлена вкладка настройки Яндекс.Метрики (ID счетчика, Вебвизор 2.0, E-commerce `dataLayer`), Google Analytics 4 (`G-XXXXXXX`), Google Tag Manager (`GTM-XXXXXXX`) и Top.Mail.Ru.
  - Созданы ЧПУ-страницы категорий `/catalog` и `/catalog/[slug]` с микроразметкой `BreadcrumbList` и `CollectionPage`, включенные в `sitemap.xml`.
  - Реализован эндпоинт `/api/admin/indexnow` для мгновенной отправки страниц в Яндекс и Bing по протоколу IndexNow и чек-лист готовности к индексации из 10 пунктов.

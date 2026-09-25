# wobuy. - Ozon Scraper Microservice (Playwright)

Автономный микросервис для сбора реальных товаров, цен, подтвержденных SKU и CDN-изображений с маркетплейса Ozon для проекта **wobuy.**.

---

## 🚀 Быстрый запуск на Amvera (2 минуты):

1. Зайди в личный кабинет [Amvera Cloud](https://amvera.ru/).
2. Создай новый проект:
   - **Тип**: Приложение
   - **Окружение**: Docker
3. Загрузи файлы из папки `services/ozon-scraper/` (или подключи через Git):
   - `package.json`
   - `server.js`
   - `Dockerfile`
   - `amvera.yml`
4. Нажми **«Собрать и запустить»**.
5. Скопируй выданный URL приложения (например, `https://ozon-scraper-knyavik.amvera.io`).
6. В основном проекте **wobuy.** в `.env.local` или переменные Vercel добавь:
   ```env
   OZON_SCRAPER_WORKER_URL="https://ozon-scraper-knyavik.amvera.io"
   ```

---

## 🌐 Альтернатива: запуск на Render.com (Бесплатно):

1. Зайди на [Render.com](https://render.com/) -> **New Web Service**.
2. Подключи репозиторий GitHub.
3. Укажи:
   - **Root Directory**: `services/ozon-scraper`
   - **Environment**: Docker
   - **Plan**: Free
4. Полученный адрес `https://...onrender.com` пропиши в `OZON_SCRAPER_WORKER_URL`.

---

## 🧪 Проверка работы API:

```bash
curl "https://your-service-url/search?q=лопата+для+снега"
```

Ответ:

```json
{
  "status": "ok",
  "source": "live",
  "query": "лопата для снега",
  "count": 12,
  "products": [
    {
      "id": "ozon-142839210",
      "sku": "142839210",
      "marketplace": "ozon",
      "title": "Лопата снегоуборочная автомобильная 38x36 см",
      "url": "https://www.ozon.ru/product/142839210/",
      "imageUrl": "https://ir.ozone.ru/s3/multimedia-1/wc1000/6819201937.jpg",
      "price": 1290,
      "originalPrice": 1690,
      "currency": "RUB",
      "rating": 4.8,
      "reviewCount": 380,
      "deliveryText": "Завтра (со склада Ozon)"
    }
  ]
}
```

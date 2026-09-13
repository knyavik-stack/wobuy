# wobuy. - Ozon Scraper Microservice Dockerfile
FROM mcr.microsoft.com/playwright:v1.50.1-noble

WORKDIR /app

# Копируем манифесты
COPY package*.json ./

# Установка зависимостей
RUN npm install --omit=dev --no-audit
RUN npx playwright install chromium

# Копируем исходный код
COPY . .

# Порт сервиса
ENV PORT=8080
EXPOSE 8080

# Запуск приложения
CMD ["node", "server.js"]

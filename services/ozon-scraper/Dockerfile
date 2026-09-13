# wobuy. - Ozon Scraper Microservice Dockerfile
FROM mcr.microsoft.com/playwright:v1.50.1-noble

WORKDIR /app

# Копируем манифесты
COPY package*.json ./

# Установка зависимостей
RUN npm ci --omit=dev

# Копируем исходный код
COPY . .

# Порт сервиса
ENV PORT=8080
EXPOSE 8080

# Запуск приложения
CMD ["node", "server.js"]

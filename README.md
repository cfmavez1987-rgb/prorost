# ПроРосТ — AI-помощник для соцсетей

Мобильное приложение + рекламный лендинг + backend API.

## Структура проекта

```
prorost/
├── backend/          # Node.js + Express + PostgreSQL API
├── mobile/           # React Native / Expo приложение
├── landing/          # Рекламный лендинг (один HTML-файл)
└── package.json      # Корневые скрипты
```

## Быстрый старт (локально)

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env   # настроить DATABASE_URL, JWT_SECRET, LLM_API_KEY
npm run db:init
npx tsx src/db/seed.ts
npm run dev             # http://localhost:3000

# 2. Приложение
cd mobile
npm install
npx expo start --web    # http://localhost:8081

# 3. Лендинг
open landing/index.html
```

## Деплой

### Backend → Railway

1. Залей репозиторий на GitHub
2. Зайди на [railway.app](https://railway.app)
3. New Project → Deploy from GitHub repo → выбери репозиторий
4. Railway автоматически определит `backend/Dockerfile`
5. Добавь переменные окружения:
   - `DATABASE_URL` — Railway сам создаст PostgreSQL (Add Service → PostgreSQL)
   - `JWT_SECRET` — любой длинный случайный ключ
   - `LLM_BASE_URL` — URL MiMoCode LLM сервера
   - `LLM_API_KEY` — токен MiMoCode
   - `LLM_MODEL` — `xiaomi/mimo-v2.5-pro`
6. Deploy → получишь URL вида `https://prorost-backend.up.railway.app`

### Лендинг → Vercel

1. Зайди на [vercel.com](https://vercel.com)
2. New Project → Import Git Repository
3. Root Directory: `landing`
4. Framework Preset: Other
5. Deploy → получишь URL вида `https://prorost.vercel.app`

### Мобильное приложение

```bash
# Установить EAS CLI
npm install -g eas-cli

# Авторизоваться
eas login

# Собрать для iOS/Android
eas build --platform all
```

## API-контракт

| Группа | Эндпоинты |
|--------|-----------|
| Auth | `POST /v1/auth/login`, `POST /v1/auth/register`, `GET /v1/auth/me` |
| Posts | `GET/POST /v1/posts`, `GET/PATCH/DELETE /v1/posts/:id`, `POST /v1/posts/:id/schedule` |
| AI | `POST /v1/ai/generate` |
| Analytics | `GET /v1/analytics/overview`, `GET /v1/analytics/posts/:id`, `GET /v1/analytics/reach` |
| Social | `GET /v1/social-accounts`, `GET /v1/social-accounts/connect/:provider`, `DELETE /v1/social-accounts/:id` |

## Тестовые данные

- **Email**: test@prorost.ru
- **Пароль**: password123

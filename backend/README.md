# ПроРосТ — Backend API

Node.js + Express + TypeScript + PostgreSQL + YandexGPT

## Быстрый старт

### 1. Установить PostgreSQL

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Создать базу
createdb prorost
```

### 2. Установить зависимости

```bash
cd backend
npm install
```

### 3. Настроить окружение

```bash
cp .env.example .env
# Отредактируй .env — укажи DATABASE_URL и JWT_SECRET
```

### 4. Инициализировать базу

```bash
npm run db:init
```

### 5. Заполнить тестовыми данными

```bash
npx tsx src/db/seed.ts
```

### 6. Запустить сервер

```bash
npm run dev
```

Сервер запустится на `http://localhost:3000`.

Проверка: `curl http://localhost:3000/health`

---

## API Endpoints

### Auth
| Метод | Эндпоинт | Описание | Auth |
|-------|-----------|----------|------|
| POST | `/v1/auth/register` | Регистрация | Нет |
| POST | `/v1/auth/login` | Вход | Нет |
| GET | `/v1/auth/me` | Текущий пользователь | Да |

### Posts
| Метод | Эндпоинт | Описание | Auth |
|-------|-----------|----------|------|
| GET | `/v1/posts?page=&limit=` | Список постов | Да |
| GET | `/v1/posts/:id` | Один пост | Да |
| POST | `/v1/posts` | Создать | Да |
| PATCH | `/v1/posts/:id` | Обновить | Да |
| DELETE | `/v1/posts/:id` | Удалить | Да |
| POST | `/v1/posts/:id/schedule` | Запланировать | Да |

### AI
| Метод | Эндпоинт | Описание | Auth |
|-------|-----------|----------|------|
| POST | `/v1/ai/generate` | Генерация текста | Да |

### Analytics
| Метод | Эндпоинт | Описание | Auth |
|-------|-----------|----------|------|
| GET | `/v1/analytics/overview` | Общая статистика | Да |
| GET | `/v1/analytics/posts/:id` | Аналитика поста | Да |
| GET | `/v1/analytics/reach?days=` | Динамика охватов | Да |

### Social Accounts
| Метод | Эндпоинт | Описание | Auth |
|-------|-----------|----------|------|
| GET | `/v1/social-accounts` | Список | Да |
| GET | `/v1/social-accounts/connect/:provider` | OAuth URL | Да |
| DELETE | `/v1/social-accounts/:id` | Отключить | Да |

---

## Тестовые данные

После `seed`:
- **Email**: test@prorost.ru
- **Пароль**: password123
- 8 постов с разными статусами
- 2 подключённых соцаккаунта (VK, Telegram)
- Аналитика за 30 дней

## YandexGPT

Для AI-генерации добавь в `.env`:
```
YANDEX_API_KEY=your-key
YANDEX_FOLDER_ID=your-folder-id
```

Без ключа работает fallback-генерация из шаблонов.

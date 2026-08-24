# ПроРосТ — мобильное приложение

Мобильное приложение для ведения соцсетей с AI-генерацией постов.

## Технологии

- React Native / Expo (SDK 52)
- TypeScript
- @react-navigation (stack + bottom tabs)
- @react-native-async-storage/async-storage
- REST API с JWT-авторизацией

## Запуск

```bash
# Установить зависимости
npm install

# Запустить Expo
npx expo start

# Или сразу на устройство/эмулятор
npx expo start --ios
npx expo start --android
```

## Структура проекта

```
src/
├── api/
│   └── client.ts          # REST API-клиент, типы, эндпоинты
├── components/
│   ├── Button.tsx          # Кнопка (primary/secondary/ghost)
│   ├── Input.tsx           # Текстовое поле с валидацией
│   ├── MetricCard.tsx      # Карточка метрики для аналитики
│   ├── PostCard.tsx        # Карточка поста в ленте
│   └── States.tsx          # EmptyState, LoadingScreen, ErrorState
├── context/
│   └── AuthContext.tsx      # Контекст авторизации (JWT, login/logout)
├── navigation/
│   ├── AuthNavigator.tsx   # Стек авторизации (Login/Register)
│   └── MainNavigator.tsx   # Основная навигация (tabs + stack)
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   └── main/
│       ├── FeedScreen.tsx          # Лента постов
│       ├── CreatePostScreen.tsx    # Создание/редактирование + AI
│       ├── AnalyticsScreen.tsx     # Графики и метрики
│       └── SocialAccountsScreen.tsx # Управление соцсетями
└── theme.ts                # Цвета, отступы, типографика
```

## API-контракт

Приложение работает с REST API по адресу `https://api.prorost.ru/v1`.

### Авторизация
| Метод | Эндпоинт | Описание |
|-------|-----------|----------|
| POST | `/auth/login` | Вход (email, password) → JWT |
| POST | `/auth/register` | Регистрация (email, password, name) → JWT |
| GET | `/auth/me` | Текущий пользователь |

### Посты
| Метод | Эндпоинт | Описание |
|-------|-----------|----------|
| GET | `/posts?page=&limit=` | Список постов |
| GET | `/posts/:id` | Один пост |
| POST | `/posts` | Создать черновик |
| PATCH | `/posts/:id` | Обновить пост |
| DELETE | `/posts/:id` | Удалить пост |
| POST | `/posts/:id/schedule` | Запланировать публикацию |

### AI-генерация
| Метод | Эндпоинт | Описание |
|-------|-----------|----------|
| POST | `/ai/generate` | Генерация текста (topic, tone) |

### Аналитика
| Метод | Эндпоинт | Описание |
|-------|-----------|----------|
| GET | `/analytics/overview` | Общая статистика |
| GET | `/analytics/posts/:id` | Аналитика поста |
| GET | `/analytics/reach?days=` | Динамика охватов |

### Соцсети
| Метод | Эндпоинт | Описание |
|-------|-----------|----------|
| GET | `/social-accounts` | Список подключённых |
| GET | `/social-accounts/connect/:provider` | OAuth-ссылка |
| DELETE | `/social-accounts/:id` | Отключить аккаунт |

## Что осталось доделать

- [ ] Реальный OAuth-флоу для подключения соцсетей (сейчас открывает URL)
- [ ] Выбор даты/времени для планирования (сейчас фиксировано на завтра 12:00)
- [ ] Push-уведомления о статусе публикации
- [ ] Тёмная тема
- [ ] Кастомные иконки табов (сейчас эмодзи)
- [ ] Загрузка изображений к постам
- [ ] Кеширование и офлайн-режим
- [ ] Тесты
- [ ] Подключение к реальному backend

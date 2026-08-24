import { Post, AnalyticsOverview, ReachDynamics, SocialAccount, AuthResponse, GenerateResponse } from './client';

const MOCK_USER = { id: '1', email: 'anna@cafe-uyut.ru', name: 'Анна Кузнецова' };

export const MOCK_AUTH: AuthResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: MOCK_USER,
};

const now = new Date();
function daysAgo(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function hoursAgo(n: number): string {
  const d = new Date(now);
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    text: 'Утренний кофе — это ритуал. А утренний кофе с круассаном в нашем кафе — это маленькое счастье. Приходите завтракать с 8:00, свежая выпечка каждый день 🥐',
    topic: 'Утренние завтраки',
    tone: 'friendly',
    status: 'published',
    platform: 'vk',
    scheduledAt: null,
    publishedAt: daysAgo(1),
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
  {
    id: 'p2',
    text: 'Субботний мастер-класс по латте-арту! Научимся рисовать сердечки, лебедей и розетки. Все материалы включены. Стоимость — 1500₽. Запись в директ.',
    topic: 'Мастер-класс',
    tone: 'selling',
    status: 'scheduled',
    platform: 'instagram',
    scheduledAt: hoursAgo(-48),
    publishedAt: null,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'p3',
    text: 'Знаете ли вы, что наш шеф-повар каждое утро сам выбирает продукты на рынке? Свежесть — не маркетинг, а наш принцип работы. В этом сезоне особое меню с тыквой и трюфелем.',
    topic: 'Закулисье кухни',
    tone: 'expert',
    status: 'published',
    platform: 'telegram',
    scheduledAt: null,
    publishedAt: daysAgo(3),
    createdAt: daysAgo(4),
    updatedAt: daysAgo(3),
  },
  {
    id: 'p4',
    text: 'Встречайте наш новое сезонное меню! Тыквенный латте, тыквенный чизкейк и суп из запечённой тыквы с трюфельным маслом. Только до конца ноября.',
    topic: 'Сезонное меню',
    tone: 'selling',
    status: 'draft',
    platform: 'vk',
    scheduledAt: null,
    publishedAt: null,
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
  },
  {
    id: 'p5',
    text: 'Пятница — день десертов! Сегодня на каждый второй десерт скидка 30%. Торопитесь, количество ограничено 🍰',
    topic: 'Акции',
    tone: 'friendly',
    status: 'published',
    platform: 'instagram',
    scheduledAt: null,
    publishedAt: daysAgo(5),
    createdAt: daysAgo(6),
    updatedAt: daysAgo(5),
  },
  {
    id: 'p6',
    text: 'Ошибка при публикации: превышен лимит символов для Telegram. Пожалуйста, сократите текст до 4096 символов.',
    topic: 'Отзывы клиентов',
    tone: 'formal',
    status: 'error',
    platform: 'telegram',
    scheduledAt: daysAgo(2),
    publishedAt: null,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  },
  {
    id: 'p7',
    text: 'Спасибо всем, кто пришёл на нашу дегустацию кофе из Эфиопии! Ваши отзывы вдохновляют. Следующая дегустация — через две недели, следите за анонсами.',
    topic: 'События',
    tone: 'friendly',
    status: 'published',
    platform: 'vk',
    scheduledAt: null,
    publishedAt: daysAgo(7),
    createdAt: daysAgo(8),
    updatedAt: daysAgo(7),
  },
  {
    id: 'p8',
    text: 'Ищем бариста в нашу команду! Гибкий график, обучение, дружный коллектив и, конечно, бесконечный кофе. Резюме — в директ или на почту hr@cafe-uyut.ru',
    topic: 'Вакансия',
    tone: 'casual',
    status: 'scheduled',
    platform: 'telegram',
    scheduledAt: hoursAgo(-24),
    publishedAt: null,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
];

export const MOCK_ANALYTICS: AnalyticsOverview = {
  totalPosts: 47,
  totalReach: 28500,
  engagementRate: 4.7,
  followersCount: 1283,
  followersDelta: 156,
};

export const MOCK_REACH: ReachDynamics = {
  labels: Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 29 + i);
    return d.toISOString().slice(0, 10);
  }),
  reach: [
    420, 380, 510, 620, 580, 710, 890, 920, 850, 780,
    1050, 1120, 980, 870, 940, 1200, 1350, 1100, 980, 1250,
    1400, 1320, 1180, 1500, 1650, 1420, 1380, 1700, 1850, 1920,
  ],
  engagement: [
    3.2, 3.1, 3.5, 4.0, 3.8, 4.2, 4.5, 4.8, 4.3, 4.1,
    4.6, 5.0, 4.4, 4.0, 4.3, 5.1, 5.4, 4.8, 4.5, 5.0,
    5.3, 5.1, 4.7, 5.5, 5.8, 5.2, 5.0, 5.6, 6.0, 5.8,
  ],
};

export const MOCK_SOCIAL_ACCOUNTS: SocialAccount[] = [
  { id: 'sa1', provider: 'vk', username: 'cafe_uyut_msk', connectedAt: daysAgo(30) },
  { id: 'sa2', provider: 'telegram', username: 'cafe_uyut', connectedAt: daysAgo(15) },
];

const GENERATED_TEXTS: Record<string, Record<string, string>> = {
  'кофе': {
    friendly: 'Знаете, что делает утро лучше? Аромат свежесваренного кофе, который разливается по всему залу. В нашем кафе каждая чашка — это маленькая история: отборные зёрна, идеальная температура и бариста, который влюблен в своё дело. Заходите — расскажем, почему наш капучино такой особенный ☕',
    expert: 'Мы работаем с Specialty Coffee Association и используем зёрна класса specialty с оценкой выше 80 баллов. Обжарка происходит каждую неделю на локальной обжарочной мастерской. Это не просто кофе — это результат работы фермеров, обжарщиков и наших бариста.',
    selling: '☕ Успейте попробовать наш фирменный «Утренний ритуал» — двойной эспрессо с карамельным сиропом и овсяным молоком. Только на этой неделе — по специальной цене 250₽ вместо 350₽. Приходите, пока не разобрали!',
    casual: 'Кофе? Есть. Круассаны? Есть. Хорошее настроение? Обеспечим. Заходите к нам просто так, без повода — лучшие моменты случаются спонтанно 😊',
    formal: 'Приглашаем вас посетить наше кафе и оценить качество авторских напитков. Мы гарантируем свежесть каждого ингредиента и безупречный сервис.',
  },
  'default': {
    friendly: 'Привет! Хотим поделиться с вами кое-чем интересным. В нашем мире маленького кафе каждый день происходит что-то особенное — новая история, новый вкус, новая улыбка. Приходите стать частью этой истории! Мы всегда рады видеть вас 😊',
    expert: 'По данным исследований, регулярное посещение любимого кафе повышает уровень окситоцина на 23% и снижает стресс. Мы не просто подаём напитки — мы создаём пространство для вашего комфорта и продуктивности.',
    selling: '🔥 Горячее предложение! Только до конца недели — скидка 20% на все десерты при заказе любого напитка. Успейте попробовать наши новинки сезона по выгодной цене. Количество ограничено!',
    casual: 'Ну что, кто готов к вкусняшкам? У нас тут новые круассаны, и они просто 🔥. Залетайте, не пожалеете!',
    formal: 'Уважаемые гости, рады сообщить о запуске нового сезонного меню. Приглашаем вас оценить обновлённые блюда и напитки. Будем рады видеть вас в нашем кафе.',
  },
};

export function mockGenerate(topic: string, tone: string): GenerateResponse {
  const topicLower = topic.toLowerCase();
  const toneTexts = GENERATED_TEXTS[topicLower] || GENERATED_TEXTS['default'];
  return { text: toneTexts[tone] || toneTexts['friendly'] };
}

import { pool, query } from './pool';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('Seeding database...');

  // Создаём тестового пользователя
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await query<{ id: string }>(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = $3
     RETURNING id`,
    ['test@prorost.ru', passwordHash, 'Анна Кузнецова']
  );
  const userId = user[0].id;
  console.log(`User created: test@prorost.ru (id: ${userId})`);

  // Посты
  const posts = [
    { text: 'Утренний кофе — это ритуал. А утренний кофе с круассаном в нашем кафе — это маленькое счастье. Приходите завтракать с 8:00, свежая выпечка каждый день 🥐', topic: 'Утренние завтраки', tone: 'friendly', status: 'published', platform: 'vk' },
    { text: 'Субботний мастер-класс по латте-арту! Научимся рисовать сердечки, лебедей и розетки. Все материалы включены. Стоимость — 1500₽. Запись в директ.', topic: 'Мастер-класс', tone: 'selling', status: 'scheduled', platform: 'instagram' },
    { text: 'Знаете ли вы, что наш шеф-повар каждое утро сам выбирает продукты на рынке? Свежесть — не маркетинг, а наш принцип работы.', topic: 'Закулисье кухни', tone: 'expert', status: 'published', platform: 'telegram' },
    { text: 'Встречайте наше новое сезонное меню! Тыквенный латте, тыквенный чизкейк и суп из запечённой тыквы с трюфельным маслом.', topic: 'Сезонное меню', tone: 'selling', status: 'draft', platform: 'vk' },
    { text: 'Пятница — день десертов! Сегодня на каждый второй десерт скидка 30%. Торопитесь, количество ограничено 🍰', topic: 'Акции', tone: 'friendly', status: 'published', platform: 'instagram' },
    { text: 'Спасибо всем, кто пришёл на нашу дегустацию кофе из Эфиопии! Ваши отзывы вдохновляют.', topic: 'События', tone: 'friendly', status: 'published', platform: 'vk' },
    { text: 'Ищем бариста в нашу команду! Гибкий график, обучение, дружный коллектив и бесконечный кофе.', topic: 'Вакансия', tone: 'casual', status: 'scheduled', platform: 'telegram' },
    { text: 'Каждую среду — скидка 15% на все десерты для студентов. Покажите студенческий и наслаждайтесь!', topic: 'Студентам', tone: 'friendly', status: 'published', platform: 'vk' },
  ];

  for (const post of posts) {
    const scheduledAt = post.status === 'scheduled'
      ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      : null;
    const publishedAt = post.status === 'published'
      ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    await query(
      `INSERT INTO posts (user_id, text, topic, tone, status, platform, scheduled_at, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, post.text, post.topic, post.tone, post.status, post.platform, scheduledAt, publishedAt]
    );
  }
  console.log(`Created ${posts.length} posts`);

  // Соцсети
  await query(
    `INSERT INTO social_accounts (user_id, provider, username)
     VALUES ($1, 'vk', 'cafe_uyut_msk'), ($1, 'telegram', 'cafe_uyut')
     ON CONFLICT DO NOTHING`,
    [userId]
  );
  console.log('Created social accounts');

  // Аналитика
  const allPosts = await query<{ id: string }>('SELECT id FROM posts WHERE user_id = $1', [userId]);
  for (const post of allPosts) {
    const daysBack = Math.floor(Math.random() * 30);
    await query(
      `INSERT INTO post_analytics (post_id, reach, likes, comments, shares, engagement_rate, recorded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        post.id,
        Math.floor(Math.random() * 2000) + 200,
        Math.floor(Math.random() * 150) + 10,
        Math.floor(Math.random() * 30) + 1,
        Math.floor(Math.random() * 20),
        (Math.random() * 8 + 1).toFixed(2),
        new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
      ]
    );
  }
  console.log('Created analytics data');

  console.log('\nSeed complete!');
  console.log('Login: test@prorost.ru / password123');

  await pool.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

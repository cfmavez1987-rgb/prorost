import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import postsRoutes from './routes/posts';
import aiRoutes from './routes/ai';
import analyticsRoutes from './routes/analytics';
import socialRoutes from './routes/social';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100,
  message: { message: 'Слишком много запросов. Попробуйте позже.' },
});
app.use(limiter);

// AI rate limiting — строже
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 10,
  message: { message: 'Слишком много запросов к AI. Подождите минуту.' },
});

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/posts', postsRoutes);
app.use('/v1/ai', aiLimiter, aiRoutes);
app.use('/v1/analytics', analyticsRoutes);
app.use('/v1/social-accounts', socialRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`ПроРосТ API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;

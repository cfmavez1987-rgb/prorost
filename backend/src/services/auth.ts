import { query, queryOne } from '../db/pool';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function register(email: string, password: string, name: string) {
  const existing = await queryOne<User>('SELECT id FROM users WHERE email = $1', [email]);
  if (existing) {
    throw new AppError('Пользователь с таким email уже существует', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await queryOne<User>(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
    [email, passwordHash, name]
  );

  if (!user) throw new AppError('Не удалось создать пользователя', 500);

  const tokens = generateTokens(user.id);
  return { user, ...tokens };
}

export async function login(email: string, password: string) {
  const user = await queryOne<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (!user) throw new AppError('Неверный email или пароль', 401);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError('Неверный email или пароль', 401);

  const tokens = generateTokens(user.id);
  return {
    user: { id: user.id, email: user.email, name: user.name },
    ...tokens,
  };
}

export async function getMe(userId: string) {
  const user = await queryOne<{ id: string; email: string; name: string }>(
    'SELECT id, email, name FROM users WHERE id = $1',
    [userId]
  );
  if (!user) throw new AppError('Пользователь не найден', 404);
  return user;
}

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: 7 * 24 * 60 * 60 });
  const refreshToken = uuidv4();
  return { accessToken, refreshToken };
}

export class AppError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

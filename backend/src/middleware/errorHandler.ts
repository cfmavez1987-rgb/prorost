import { Response } from 'express';

export function handleError(res: Response, err: unknown, fallback = 'Внутренняя ошибка сервера') {
  console.error(err);
  if (err instanceof Error) {
    return res.status(500).json({ message: err.message });
  }
  res.status(500).json({ message: fallback });
}

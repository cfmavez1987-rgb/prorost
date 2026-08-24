import { Response } from 'express';
import { AuthRequest } from '../types';
import { generatePostText } from '../services/yandexGpt';
import { handleError } from '../middleware/errorHandler';

export async function generatePost(req: AuthRequest, res: Response) {
  try {
    const { topic, tone } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Тема обязательна' });
    }

    const text = await generatePostText(topic, tone || 'friendly');
    res.json({ text });
  } catch (err) {
    handleError(res, err);
  }
}

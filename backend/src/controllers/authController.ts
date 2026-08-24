import { Request, Response } from 'express';
import * as authService from '../services/auth';
import { AuthRequest } from '../types';
import { handleError } from '../middleware/errorHandler';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, пароль и имя обязательны' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Некорректный email' });
    }

    const result = await authService.register(email, password, name);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof authService.AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    handleError(res, err);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    if (err instanceof authService.AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    handleError(res, err);
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await authService.getMe(req.userId!);
    res.json(user);
  } catch (err) {
    if (err instanceof authService.AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    handleError(res, err);
  }
}

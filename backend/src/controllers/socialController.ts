import { Response } from 'express';
import { query, queryOne } from '../db/pool';
import { AuthRequest, SocialAccount } from '../types';
import { handleError } from '../middleware/errorHandler';

export async function getAccounts(req: AuthRequest, res: Response) {
  try {
    const accounts = await query<SocialAccount>(
      `SELECT id, provider, username, connected_at as "connectedAt"
       FROM social_accounts
       WHERE user_id = $1
       ORDER BY connected_at`,
      [req.userId]
    );

    res.json(accounts);
  } catch (err) {
    handleError(res, err);
  }
}

export async function connectAccount(req: AuthRequest, res: Response) {
  try {
    const provider = req.params.provider as string;
    const validProviders = ['vk', 'telegram', 'instagram'];

    if (!validProviders.includes(provider)) {
      return res.status(400).json({ message: 'Неподдерживаемая соцсеть' });
    }

    // В реальном приложении здесь будет OAuth-флоу
    // Пока возвращаем URL для редиректа
    const oauthUrls: Record<string, string> = {
      vk: 'https://oauth.vk.com/authorize?client_id=APP_ID&scope=manage,wall&response_type=code&redirect_uri=YOUR_REDIRECT_URI',
      telegram: 'https://oauth.telegram.org/auth?bot_id=YOUR_BOT_ID&origin=YOUR_DOMAIN',
      instagram: 'https://api.instagram.com/oauth/authorize?client_id=APP_ID&scope=user_profile,user_media&response_type=code&redirect_uri=YOUR_REDIRECT_URI',
    };

    res.json({ url: oauthUrls[provider] });
  } catch (err) {
    handleError(res, err);
  }
}

export async function disconnectAccount(req: AuthRequest, res: Response) {
  try {
    const result = await queryOne(
      'DELETE FROM social_accounts WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (!result) return res.status(404).json({ message: 'Аккаунт не найден' });
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
}

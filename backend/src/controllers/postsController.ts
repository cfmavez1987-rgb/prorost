import { Response } from 'express';
import { query, queryOne } from '../db/pool';
import { AuthRequest, Post } from '../types';
import { handleError } from '../middleware/errorHandler';

export async function getPosts(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const [posts, countResult] = await Promise.all([
      query<Post>(
        'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [req.userId, limit, offset]
      ),
      queryOne<{ count: string }>(
        'SELECT COUNT(*)::text as count FROM posts WHERE user_id = $1',
        [req.userId]
      ),
    ]);

    res.json({
      posts,
      total: parseInt(countResult?.count || '0'),
      page,
      limit,
    });
  } catch (err) {
    handleError(res, err);
  }
}

export async function getPost(req: AuthRequest, res: Response) {
  try {
    const post = await queryOne<Post>(
      'SELECT * FROM posts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (!post) return res.status(404).json({ message: 'Пост не найден' });
    res.json(post);
  } catch (err) {
    handleError(res, err);
  }
}

export async function createPost(req: AuthRequest, res: Response) {
  try {
    const { text, topic, tone, platform } = req.body;

    if (!text || !topic || !tone) {
      return res.status(400).json({ message: 'Текст, тема и тон обязательны' });
    }

    const post = await queryOne<Post>(
      `INSERT INTO posts (user_id, text, topic, tone, platform)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.userId, text, topic, tone, platform || 'vk']
    );

    res.status(201).json(post);
  } catch (err) {
    handleError(res, err);
  }
}

export async function updatePost(req: AuthRequest, res: Response) {
  try {
    const { text, topic, tone, platform } = req.body;
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (text !== undefined) { fields.push(`text = $${idx++}`); values.push(text); }
    if (topic !== undefined) { fields.push(`topic = $${idx++}`); values.push(topic); }
    if (tone !== undefined) { fields.push(`tone = $${idx++}`); values.push(tone); }
    if (platform !== undefined) { fields.push(`platform = $${idx++}`); values.push(platform); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Нечего обновлять' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(req.params.id, req.userId);

    const post = await queryOne<Post>(
      `UPDATE posts SET ${fields.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx}
       RETURNING *`,
      values
    );

    if (!post) return res.status(404).json({ message: 'Пост не найден' });
    res.json(post);
  } catch (err) {
    handleError(res, err);
  }
}

export async function deletePost(req: AuthRequest, res: Response) {
  try {
    const result = await queryOne(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (!result) return res.status(404).json({ message: 'Пост не найден' });
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
}

export async function schedulePost(req: AuthRequest, res: Response) {
  try {
    const { scheduledAt } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ message: 'Дата публикации обязательна' });
    }

    const post = await queryOne<Post>(
      `UPDATE posts
       SET status = 'scheduled', scheduled_at = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [scheduledAt, req.params.id, req.userId]
    );

    if (!post) return res.status(404).json({ message: 'Пост не найден' });
    res.json(post);
  } catch (err) {
    handleError(res, err);
  }
}

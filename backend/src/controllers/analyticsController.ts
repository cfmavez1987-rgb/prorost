import { Response } from 'express';
import { query, queryOne } from '../db/pool';
import { AuthRequest } from '../types';
import { handleError } from '../middleware/errorHandler';

export async function getOverview(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    const [postsCount, analyticsAgg, latestAnalytics] = await Promise.all([
      queryOne<{ count: string }>(
        'SELECT COUNT(*)::text as count FROM posts WHERE user_id = $1',
        [userId]
      ),
      queryOne<{ total_reach: string; avg_engagement: string }>(
        `SELECT
           COALESCE(SUM(pa.reach), 0)::text as total_reach,
           COALESCE(AVG(pa.engagement_rate), 0)::text as avg_engagement
         FROM post_analytics pa
         JOIN posts p ON p.id = pa.post_id
         WHERE p.user_id = $1`,
        [userId]
      ),
      query<{ reach: number }>(
        `SELECT pa.reach
         FROM post_analytics pa
         JOIN posts p ON p.id = pa.post_id
         WHERE p.user_id = $1
         ORDER BY pa.recorded_at DESC
         LIMIT 30`,
        [userId]
      ),
    ]);

    // Подписчики — мок, т.к. нужна интеграция с API соцсетей
    const followersCount = 1283;
    const followersDelta = 156;

    res.json({
      totalPosts: parseInt(postsCount?.count || '0'),
      totalReach: parseInt(analyticsAgg?.total_reach || '0'),
      engagementRate: parseFloat(analyticsAgg?.avg_engagement || '0'),
      followersCount,
      followersDelta,
    });
  } catch (err) {
    handleError(res, err);
  }
}

export async function getPostAnalytics(req: AuthRequest, res: Response) {
  try {
    const analytics = await queryOne(
      `SELECT pa.*
       FROM post_analytics pa
       JOIN posts p ON p.id = pa.post_id
       WHERE pa.post_id = $1 AND p.user_id = $2`,
      [req.params.id, req.userId]
    );

    if (!analytics) {
      return res.json({
        postId: req.params.id,
        reach: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        engagementRate: 0,
      });
    }

    res.json(analytics);
  } catch (err) {
    handleError(res, err);
  }
}

export async function getReachDynamics(req: AuthRequest, res: Response) {
  try {
    const days = Math.min(90, Math.max(7, parseInt(req.query.days as string) || 30));

    const rows = await query<{ day: string; reach: string; engagement: string }>(
      `SELECT
         TO_CHAR(pa.recorded_at, 'YYYY-MM-DD') as day,
         SUM(pa.reach)::text as reach,
         AVG(pa.engagement_rate)::text as engagement
       FROM post_analytics pa
       JOIN posts p ON p.id = pa.post_id
       WHERE p.user_id = $1
         AND pa.recorded_at >= NOW() - INTERVAL '${days} days'
       GROUP BY day
       ORDER BY day`,
      [req.userId]
    );

    // Если данных нет — возвращаем пустые массивы
    if (rows.length === 0) {
      const labels: string[] = [];
      const reach: number[] = [];
      const engagement: number[] = [];
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        labels.push(d.toISOString().slice(0, 10));
        reach.push(0);
        engagement.push(0);
      }
      return res.json({ labels, reach, engagement });
    }

    res.json({
      labels: rows.map(r => r.day),
      reach: rows.map(r => parseInt(r.reach)),
      engagement: rows.map(r => parseFloat(r.engagement)),
    });
  } catch (err) {
    handleError(res, err);
  }
}

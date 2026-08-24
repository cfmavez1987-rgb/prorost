import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Post {
  id: string;
  user_id: string;
  text: string;
  topic: string;
  tone: string;
  status: 'draft' | 'scheduled' | 'published' | 'error';
  platform: string;
  scheduled_at: Date | null;
  published_at: Date | null;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id: string | null;
  username: string;
  connected_at: Date;
}

export interface PostAnalytics {
  id: string;
  post_id: string;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number;
  recorded_at: Date;
}

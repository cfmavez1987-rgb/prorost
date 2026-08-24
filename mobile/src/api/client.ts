import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  MOCK_AUTH,
  MOCK_POSTS,
  MOCK_ANALYTICS,
  MOCK_REACH,
  MOCK_SOCIAL_ACCOUNTS,
  mockGenerate,
} from './mockData';

const BASE_URL = 'https://api-production-ab02c.up.railway.app/v1';
const TOKEN_KEY = 'auth_token';
const REFRESH_KEY = 'refresh_token';

// Переключите на true для работы без backend
const USE_MOCK = false;

// Хранилище: localStorage на web, AsyncStorage на native
const storage = Platform.OS === 'web' ? {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => { localStorage.setItem(key, value); return Promise.resolve(); },
  removeItem: (key: string) => { localStorage.removeItem(key); return Promise.resolve(); },
} : AsyncStorage;

// Имитация задержки сети
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private mockPosts: Post[] = [...MOCK_POSTS];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getToken(): Promise<string | null> {
    return storage.getItem(TOKEN_KEY);
  }

  async setTokens(access: string, refresh: string): Promise<void> {
    await storage.setItem(TOKEN_KEY, access);
    await storage.setItem(REFRESH_KEY, refresh);
  }

  async clearTokens(): Promise<void> {
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(REFRESH_KEY);
  }

  private async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, auth = true } = opts;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (auth) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      await this.clearTokens();
      throw new AuthError('Сессия истекла. Войдите снова.');
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(data.message || `Ошибка ${res.status}`, res.status);
    }

    return res.json();
  }

  // ── Auth ──
  async login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      await delay(600);
      return { ...MOCK_AUTH, user: { ...MOCK_AUTH.user, email } };
    }
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      await delay(600);
      return { ...MOCK_AUTH, user: { id: '1', email, name } };
    }
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
      auth: false,
    });
  }

  async getMe(): Promise<User> {
    if (USE_MOCK) {
      await delay(200);
      return MOCK_AUTH.user;
    }
    return this.request<User>('/auth/me');
  }

  // ── Posts ──
  async getPosts(page = 1, limit = 20): Promise<PostsResponse> {
    if (USE_MOCK) {
      await delay(500);
      const start = (page - 1) * limit;
      const posts = this.mockPosts.slice(start, start + limit);
      return { posts, total: this.mockPosts.length, page, limit };
    }
    return this.request<PostsResponse>(`/posts?page=${page}&limit=${limit}`);
  }

  async getPost(id: string): Promise<Post> {
    if (USE_MOCK) {
      await delay(300);
      const post = this.mockPosts.find(p => p.id === id);
      if (!post) throw new ApiError('Пост не найден', 404);
      return post;
    }
    return this.request<Post>(`/posts/${id}`);
  }

  async createPost(data: CreatePostData): Promise<Post> {
    if (USE_MOCK) {
      await delay(400);
      const now = new Date().toISOString();
      const post: Post = {
        id: 'p' + Date.now(),
        text: data.text,
        topic: data.topic,
        tone: data.tone,
        status: 'draft',
        platform: data.platform || 'vk',
        scheduledAt: null,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      this.mockPosts.unshift(post);
      return post;
    }
    return this.request<Post>('/posts', { method: 'POST', body: data });
  }

  async updatePost(id: string, data: Partial<CreatePostData>): Promise<Post> {
    if (USE_MOCK) {
      await delay(300);
      const idx = this.mockPosts.findIndex(p => p.id === id);
      if (idx === -1) throw new ApiError('Пост не найден', 404);
      this.mockPosts[idx] = { ...this.mockPosts[idx], ...data, updatedAt: new Date().toISOString() };
      return this.mockPosts[idx];
    }
    return this.request<Post>(`/posts/${id}`, { method: 'PATCH', body: data });
  }

  async deletePost(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(300);
      this.mockPosts = this.mockPosts.filter(p => p.id !== id);
      return;
    }
    return this.request<void>(`/posts/${id}`, { method: 'DELETE' });
  }

  async schedulePost(id: string, scheduledAt: string): Promise<Post> {
    if (USE_MOCK) {
      await delay(400);
      const idx = this.mockPosts.findIndex(p => p.id === id);
      if (idx === -1) throw new ApiError('Пост не найден', 404);
      this.mockPosts[idx] = { ...this.mockPosts[idx], status: 'scheduled', scheduledAt, updatedAt: new Date().toISOString() };
      return this.mockPosts[idx];
    }
    return this.request<Post>(`/posts/${id}/schedule`, {
      method: 'POST',
      body: { scheduledAt },
    });
  }

  // ── AI ──
  async generatePost(topic: string, tone: string): Promise<GenerateResponse> {
    if (USE_MOCK) {
      await delay(1200);
      return mockGenerate(topic, tone);
    }
    return this.request<GenerateResponse>('/ai/generate', {
      method: 'POST',
      body: { topic, tone },
    });
  }

  // ── Analytics ──
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    if (USE_MOCK) {
      await delay(500);
      return MOCK_ANALYTICS;
    }
    return this.request<AnalyticsOverview>('/analytics/overview');
  }

  async getPostAnalytics(postId: string): Promise<PostAnalytics> {
    if (USE_MOCK) {
      await delay(300);
      return { postId, reach: 1250, likes: 87, comments: 12, shares: 5, engagementRate: 8.3 };
    }
    return this.request<PostAnalytics>(`/analytics/posts/${postId}`);
  }

  async getReachDynamics(days = 30): Promise<ReachDynamics> {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_REACH;
    }
    return this.request<ReachDynamics>(`/analytics/reach?days=${days}`);
  }

  // ── Social Accounts ──
  async getSocialAccounts(): Promise<SocialAccount[]> {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_SOCIAL_ACCOUNTS;
    }
    return this.request<SocialAccount[]>('/social-accounts');
  }

  async connectSocialAccount(provider: string): Promise<OAuthUrl> {
    if (USE_MOCK) {
      await delay(500);
      return { url: `https://oauth.mock/${provider}` };
    }
    return this.request<OAuthUrl>(`/social-accounts/connect/${provider}`);
  }

  async disconnectSocialAccount(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(300);
      return;
    }
    return this.request<void>(`/social-accounts/${id}`, { method: 'DELETE' });
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class AuthError extends ApiError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthError';
  }
}

// ── Types ──
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'error';

export interface Post {
  id: string;
  text: string;
  topic: string;
  tone: string;
  status: PostStatus;
  platform: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePostData {
  text: string;
  topic: string;
  tone: string;
  platform?: string;
}

export interface GenerateResponse {
  text: string;
}

export interface AnalyticsOverview {
  totalPosts: number;
  totalReach: number;
  engagementRate: number;
  followersCount: number;
  followersDelta: number;
}

export interface PostAnalytics {
  postId: string;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

export interface ReachDynamics {
  labels: string[];
  reach: number[];
  engagement: number[];
}

export interface SocialAccount {
  id: string;
  provider: 'vk' | 'telegram' | 'instagram';
  username: string;
  connectedAt: string;
}

export interface OAuthUrl {
  url: string;
}

export const api = new ApiClient(BASE_URL);

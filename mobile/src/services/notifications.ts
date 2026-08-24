import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from '../api/client';

// Настройка обработки уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private initialized = false;

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    // Регистрируем обработчик уведомлений
    Notifications.addNotificationReceivedListener(this.onReceive);
    Notifications.addNotificationResponseReceivedListener(this.onResponse);
  }

  async requestPermission(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Push-уведомления работают только на реальном устройстве');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Разрешение на уведомления не получено');
      return false;
    }

    // Получаем push-токен
    const token = await this.getToken();
    if (token) {
      await this.registerToken(token);
    }

    return true;
  }

  async getToken(): Promise<string | null> {
    try {
      const projectId = Constants?.default?.expoConfig?.extra?.eas?.projectId
        || Constants?.default?.manifest2?.extra?.eas?.projectId;
      if (!projectId) {
        console.log('Project ID не найден');
        return null;
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return token;
    } catch (err) {
      console.error('Ошибка получения push-токена:', err);
      return null;
    }
  }

  async registerToken(token: string) {
    try {
      // Отправляем токен на backend
      const baseUrl = 'https://api-production-ab02c.up.railway.app/v1';
      await fetch(`${baseUrl}/notifications/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await api.getToken()}`,
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
        }),
      });
    } catch (err) {
      console.error('Ошибка регистрации токена:', err);
    }
  }

  // Локальное уведомление (для web и тестирования)
  async sendLocal(title: string, body: string, data?: Record<string, unknown>) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // сразу
    });
  }

  // Уведомление о публикации поста
  async notifyPostPublished(postTopic: string) {
    await this.sendLocal(
      'Пост опубликован',
      `Ваш пост «${postTopic}» успешно опубликован`,
      { type: 'post_published' }
    );
  }

  // Уведомление об ошибке публикации
  async notifyPostError(postTopic: string, error: string) {
    await this.sendLocal(
      'Ошибка публикации',
      `Не удалось опубликовать «${postTopic}»: ${error}`,
      { type: 'post_error' }
    );
  }

  // Уведомление о запланированном посте
  async notifyPostScheduled(postTopic: string, date: Date) {
    const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    await this.sendLocal(
      'Пост запланирован',
      `«${postTopic}» будет опубликован ${dateStr} в ${timeStr}`,
      { type: 'post_scheduled' }
    );
  }

  private onReceive = (notification: Notifications.Notification) => {
    console.log('Уведомление получено:', notification);
  };

  private onResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    console.log('Уведомление открыто:', data);
    // Здесь можно навигировать на нужный экран
  };
}

// Импорт Constants
let Constants: typeof import('expo-constants') | null = null;
try {
  Constants = require('expo-constants');
} catch {
  // expo-constants не доступен
}

export const notifications = new NotificationService();

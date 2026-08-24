import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { api, SocialAccount, ApiError } from '../../api/client';
import { Button } from '../../components/Button';
import { LoadingScreen, EmptyState, ErrorState } from '../../components/States';
import { useTheme, fontSize, radius, spacing } from '../../theme';

const PROVIDERS = [
  { id: 'vk', name: 'ВКонтакте', color: '#4C75A3', icon: 'VK' },
  { id: 'telegram', name: 'Telegram', color: '#26A5E4', icon: 'TG' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F', icon: 'IG' },
] as const;

export function SocialAccountsScreen() {
  const { colors } = useTheme();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchAccounts() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSocialAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось загрузить аккаунты');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function handleConnect(provider: string) {
    setConnecting(provider);
    try {
      const res = await api.connectSocialAccount(provider);
      const supported = await Linking.canOpenURL(res.url);
      if (supported) {
        await Linking.openURL(res.url);
      } else {
        Alert.alert('Ошибка', 'Не удалось открыть страницу авторизации');
      }
    } catch (err) {
      Alert.alert('Ошибка', err instanceof ApiError ? err.message : 'Не удалось подключить аккаунт');
    } finally {
      setConnecting(null);
    }
  }

  async function handleDisconnect(id: string, name: string) {
    Alert.alert(
      'Отключить аккаунт?',
      `Вы уверены, что хотите отключить ${name}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Отключить',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.disconnectSocialAccount(id);
              setAccounts(prev => prev.filter(a => a.id !== id));
            } catch (err) {
              Alert.alert('Ошибка', 'Не удалось отключить аккаунт');
            }
          },
        },
      ]
    );
  }

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchAccounts} />;

  const styles = makeStyles(colors);

  const connectedProviders = new Set(accounts.map(a => a.provider));
  const availableProviders = PROVIDERS.filter(p => !connectedProviders.has(p.id as any));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Соцсети</Text>

      {accounts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Подключённые</Text>
          {accounts.map(account => {
            const provider = PROVIDERS.find(p => p.id === account.provider);
            return (
              <View key={account.id} style={styles.accountCard}>
                <View style={[styles.icon, { backgroundColor: provider?.color || colors.slate }]}>
                  <Text style={styles.iconText}>{provider?.icon || '?'}</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{provider?.name || account.provider}</Text>
                  <Text style={styles.accountUsername}>@{account.username}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDisconnect(account.id, provider?.name || account.provider)}
                  style={styles.disconnectBtn}
                >
                  <Text style={styles.disconnectText}>Отключить</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {availableProviders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Подключить</Text>
          {availableProviders.map(provider => (
            <TouchableOpacity
              key={provider.id}
              style={styles.connectCard}
              onPress={() => handleConnect(provider.id)}
              activeOpacity={0.7}
              disabled={connecting === provider.id}
            >
              <View style={[styles.icon, { backgroundColor: provider.color }]}>
                <Text style={styles.iconText}>{provider.icon}</Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{provider.name}</Text>
                <Text style={styles.accountUsername}>
                  {connecting === provider.id ? 'Подключение…' : 'Нажмите, чтобы подключить'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {accounts.length === 0 && availableProviders.length === 0 && (
        <EmptyState
          icon="🔗"
          title="Все аккаунты подключены"
          description="Вы можете управлять ими выше"
        />
      )}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  connectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderStyle: 'dashed',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.ink,
  },
  accountUsername: {
    fontSize: fontSize.sm,
    color: colors.slate,
  },
  disconnectBtn: {
    padding: spacing.sm,
  },
  disconnectText: {
    fontSize: fontSize.sm,
    color: colors.error,
    fontWeight: '500',
  },
});

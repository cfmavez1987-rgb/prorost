import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme, spacing, fontSize, radius } from '../../theme';

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Светлая', icon: '☀️' },
  { value: 'dark' as const, label: 'Тёмная', icon: '🌙' },
  { value: 'system' as const, label: 'Системная', icon: '⚙️' },
];

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const { mode, setMode, colors, isDark } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.paper }]}>
      <Text style={[styles.title, { color: colors.ink }]}>Настройки</Text>

      {/* Профиль */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.slate }]}>Профиль</Text>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.coral }]}>
            <Text style={styles.avatarText}>{user?.name?.[0] || '?'}</Text>
          </View>
          <View>
            <Text style={[styles.profileName, { color: colors.ink }]}>{user?.name}</Text>
            <Text style={[styles.profileEmail, { color: colors.slate }]}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Тема */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.slate }]}>Оформление</Text>
        {THEME_OPTIONS.map(option => {
          const selected = mode === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.themeOption,
                { borderBottomColor: colors.cardBorder },
                selected && { backgroundColor: isDark ? colors.ghost : colors.ghostLight },
              ]}
              onPress={() => setMode(option.value)}
              activeOpacity={0.7}
            >
              <View style={styles.themeOptionLeft}>
                <Text style={styles.themeIcon}>{option.icon}</Text>
                <Text style={[styles.themeLabel, { color: colors.ink }]}>{option.label}</Text>
              </View>
              {selected && (
                <View style={[styles.checkmark, { backgroundColor: colors.coral }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Выход */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: colors.error }]}
        onPress={logout}
        activeOpacity={0.7}
      >
        <Text style={[styles.logoutText, { color: colors.error }]}>Выйти из аккаунта</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  section: {
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    paddingTop: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  profileName: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: fontSize.sm,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  themeIcon: {
    fontSize: 20,
  },
  themeLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

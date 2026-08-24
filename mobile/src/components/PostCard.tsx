import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Post, PostStatus } from '../api/client';
import { colors, fontSize, radius, spacing } from '../theme';

interface PostCardProps {
  post: Post;
  onPress: (post: Post) => void;
}

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Черновик', color: colors.slate, bg: colors.ghostLight },
  scheduled: { label: 'Запланирован', color: '#2563EB', bg: '#EFF6FF' },
  published: { label: 'Опубликован', color: colors.success, bg: '#F0FDF4' },
  error: { label: 'Ошибка', color: colors.error, bg: '#FEF2F2' },
};

export function PostCard({ post, onPress }: PostCardProps) {
  const status = STATUS_CONFIG[post.status];
  const preview = post.text.length > 120 ? post.text.slice(0, 120) + '…' : post.text;
  // Поддержка обоих форматов: camelCase и snake_case
  const scheduledAt = post.scheduledAt || (post as any).scheduled_at;
  const publishedAt = post.publishedAt || (post as any).published_at;
  const createdAt = post.createdAt || (post as any).created_at;
  const date = scheduledAt || publishedAt || createdAt;
  const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      onPress={() => onPress(post)}
      activeOpacity={0.7}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <Text style={styles.text}>{preview}</Text>
      <View style={styles.footer}>
        <Text style={styles.topic}>{post.topic}</Text>
        <Text style={styles.tone}>{post.tone}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ghost,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.slate,
  },
  text: {
    fontSize: fontSize.md,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  topic: {
    fontSize: fontSize.xs,
    color: colors.coral,
    fontWeight: '500',
  },
  tone: {
    fontSize: fontSize.xs,
    color: colors.slate,
  },
});

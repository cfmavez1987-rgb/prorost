import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

interface PostPreviewProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  text: string;
  platform: string;
  topic: string;
  images?: string[];
  scheduledDate?: Date;
  confirmLabel?: string;
  loading?: boolean;
}

const PLATFORM_CONFIG: Record<string, { name: string; color: string; icon: string; bg: string }> = {
  vk: { name: 'ВКонтакте', color: '#4C75A3', icon: 'VK', bg: '#EDF1F7' },
  telegram: { name: 'Telegram', color: '#26A5E4', icon: 'TG', bg: '#E3F2FD' },
  instagram: { name: 'Instagram', color: '#E4405F', icon: 'IG', bg: '#FDE8EC' },
};

export function PostPreview({
  visible,
  onClose,
  onConfirm,
  text,
  platform,
  topic,
  images = [],
  scheduledDate,
  confirmLabel = 'Опубликовать',
  loading = false,
}: PostPreviewProps) {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.vk;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Предпросмотр</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Платформа */}
            <View style={[styles.platformBadge, { backgroundColor: config.bg }]}>
              <Text style={[styles.platformIcon, { color: config.color }]}>{config.icon}</Text>
              <Text style={[styles.platformName, { color: config.color }]}>{config.name}</Text>
            </View>

            {/* Карточка поста */}
            <View style={styles.card}>
              {/* Шапка */}
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>ПР</Text>
                </View>
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>ПроРосТ</Text>
                  <Text style={styles.authorTime}>
                    {scheduledDate
                      ? `Запланировано: ${scheduledDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} ${scheduledDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
                      : 'Черновик'}
                  </Text>
                </View>
              </View>

              {/* Текст */}
              <Text style={styles.postText}>{text}</Text>

              {/* Изображения */}
              {images.length > 0 && (
                <View style={styles.imageGrid}>
                  {images.map((uri, index) => (
                    <Image
                      key={index}
                      source={{ uri }}
                      style={[
                        styles.previewImage,
                        images.length === 1 && styles.previewImageFull,
                        images.length === 2 && styles.previewImageHalf,
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Тема */}
              <View style={styles.topicBadge}>
                <Text style={styles.topicText}>{topic}</Text>
              </View>

              {/* Имитация действий */}
              <View style={styles.actions}>
                <View style={styles.actionItem}>
                  <Text style={styles.actionIcon}>♡</Text>
                  <Text style={styles.actionText}>0</Text>
                </View>
                <View style={styles.actionItem}>
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionText}>0</Text>
                </View>
                <View style={styles.actionItem}>
                  <Text style={styles.actionIcon}>↗</Text>
                  <Text style={styles.actionText}>0</Text>
                </View>
              </View>
            </View>

            {/* Информация */}
            <View style={styles.info}>
              <Text style={styles.infoLabel}>Символов:</Text>
              <Text style={styles.infoValue}>{text.length}</Text>
            </View>
            {platform === 'twitter' && text.length > 280 && (
              <Text style={styles.warning}>Текст длиннее 280 символов для Twitter</Text>
            )}
          </ScrollView>

          {/* Кнопки */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Назад</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: config.color }, loading && styles.confirmBtnDisabled]}
              onPress={onConfirm}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.confirmBtnText}>
                {loading ? 'Отправка…' : confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.ghost,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.ink,
  },
  closeBtn: {
    fontSize: 20,
    color: colors.slate,
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  platformIcon: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  platformName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ghost,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.ink,
  },
  authorTime: {
    fontSize: fontSize.xs,
    color: colors.slate,
  },
  postText: {
    fontSize: fontSize.md,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  topicBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.ghostLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  topicText: {
    fontSize: fontSize.xs,
    color: colors.coral,
    fontWeight: '500',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  previewImage: {
    borderRadius: radius.sm,
    backgroundColor: colors.ghost,
  },
  previewImageFull: {
    width: '100%',
    height: 200,
  },
  previewImageHalf: {
    width: '48%',
    height: 150,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.ghost,
    paddingTop: spacing.sm,
    gap: spacing.xl,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIcon: {
    fontSize: 16,
    color: colors.slate,
  },
  actionText: {
    fontSize: fontSize.sm,
    color: colors.slate,
  },
  info: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.slate,
  },
  infoValue: {
    fontSize: fontSize.sm,
    color: colors.ink,
    fontWeight: '600',
  },
  warning: {
    fontSize: fontSize.sm,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.ghost,
  },
  cancelBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.ghost,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: fontSize.md,
    color: colors.ink,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    padding: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    fontSize: fontSize.md,
    color: colors.white,
    fontWeight: '600',
  },
});

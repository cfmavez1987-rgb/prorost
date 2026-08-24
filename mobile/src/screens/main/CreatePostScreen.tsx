import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform as RNPlatform,
  TouchableOpacity,
} from 'react-native';
import { api, Post, ApiError } from '../../api/client';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { DateTimePicker } from '../../components/DateTimePicker';
import { PostPreview } from '../../components/PostPreview';
import { LoadingScreen } from '../../components/States';
import { colors, fontSize, radius, spacing } from '../../theme';

const TONES = [
  { value: 'friendly', label: 'Дружелюбный' },
  { value: 'expert', label: 'Экспертный' },
  { value: 'selling', label: 'Продающий' },
  { value: 'casual', label: 'Неформальный' },
  { value: 'formal', label: 'Официальный' },
];

const PLATFORMS = [
  { value: 'vk', label: 'ВКонтакте', icon: 'VK', color: '#4C75A3' },
  { value: 'telegram', label: 'Telegram', icon: 'TG', color: '#26A5E4' },
  { value: 'instagram', label: 'Instagram', icon: 'IG', color: '#E4405F' },
];

export function CreatePostScreen({ navigation, route }: any) {
  const postId = route?.params?.postId;
  const isEditing = !!postId;

  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('friendly');
  const [platform, setPlatform] = useState('vk');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Дата/время планирования — по умолчанию завтра в 12:00
  const defaultSchedule = new Date();
  defaultSchedule.setDate(defaultSchedule.getDate() + 1);
  defaultSchedule.setHours(12, 0, 0, 0);
  const [scheduledDate, setScheduledDate] = useState(defaultSchedule);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAction, setPreviewAction] = useState<'save' | 'schedule'>('save');

  useEffect(() => {
    if (isEditing) {
      loadPost();
    }
  }, [postId]);

  async function loadPost() {
    setLoading(true);
    try {
      const post = await api.getPost(postId);
      setTopic(post.topic);
      setTone(post.tone);
      setText(post.text);
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось загрузить пост');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!topic.trim()) e.topic = 'Укажите тему поста';
    if (!text.trim()) e.text = 'Текст поста не может быть пустым';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleGenerate() {
    if (!topic.trim()) {
      setErrors({ topic: 'Сначала укажите тему' });
      return;
    }
    setGenerating(true);
    setErrors({});
    try {
      const res = await api.generatePost(topic.trim(), tone);
      setText(res.text);
    } catch (err) {
      Alert.alert('Ошибка генерации', err instanceof ApiError ? err.message : 'Не удалось сгенерировать текст');
    } finally {
      setGenerating(false);
    }
  }

  function handleSavePress() {
    if (!validate()) return;
    setPreviewAction('save');
    setShowPreview(true);
  }

  function handleSchedulePress() {
    if (!validate()) return;
    setPreviewAction('schedule');
    setShowPreview(true);
  }

  async function handleConfirm() {
    setShowPreview(false);
    if (previewAction === 'save') {
      await doSave();
    } else {
      await doSchedule();
    }
  }

  async function doSave() {
    setLoading(true);
    try {
      if (isEditing) {
        await api.updatePost(postId, { text, topic, tone, platform });
      } else {
        await api.createPost({ text, topic, tone, platform });
      }
      Alert.alert('Готово', isEditing ? 'Пост обновлён' : 'Черновик сохранён');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Ошибка', err instanceof ApiError ? err.message : 'Не удалось сохранить');
    } finally {
      setLoading(false);
    }
  }

  async function doSchedule() {
    setScheduling(true);
    try {
      let targetId = postId;
      if (!isEditing) {
        const post = await api.createPost({ text, topic, tone, platform });
        targetId = post.id;
      } else {
        await api.updatePost(postId, { text, topic, tone, platform });
      }
      await api.schedulePost(targetId, scheduledDate.toISOString());
      const dateStr = scheduledDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      });
      const timeStr = scheduledDate.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const platformLabel = PLATFORMS.find(p => p.value === platform)?.label || platform;
      Alert.alert('Запланировано', `Пост будет опубликован ${dateStr} в ${timeStr} в ${platformLabel}`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Ошибка', err instanceof ApiError ? err.message : 'Не удалось запланировать');
    } finally {
      setScheduling(false);
    }
  }

  if (loading && isEditing) return <LoadingScreen />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {isEditing ? 'Редактировать пост' : 'Новый пост'}
        </Text>

        <Input
          label="Тема поста"
          value={topic}
          onChangeText={setTopic}
          error={errors.topic}
          placeholder="О чём написать?"
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Тон текста</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tones}>
            {TONES.map(t => (
              <Button
                key={t.value}
                title={t.label}
                onPress={() => setTone(t.value)}
                variant={tone === t.value ? 'primary' : 'secondary'}
                style={styles.toneBtn}
                textStyle={styles.toneBtnText}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Канал публикации</Text>
          <View style={styles.platforms}>
            {PLATFORMS.map(p => {
              const selected = platform === p.value;
              return (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.platformBtn,
                    selected && { backgroundColor: p.color, borderColor: p.color },
                  ]}
                  onPress={() => setPlatform(p.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.platformIcon, selected && styles.platformIconSelected]}>
                    {p.icon}
                  </Text>
                  <Text style={[styles.platformLabel, selected && styles.platformLabelSelected]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Button
          title={generating ? 'Генерация…' : '✨ Сгенерировать текст'}
          onPress={handleGenerate}
          variant="ghost"
          loading={generating}
          style={styles.generateBtn}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Текст поста</Text>
          <TextInput
            style={[styles.textArea, errors.text && styles.textAreaError]}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            placeholder="Текст поста появится здесь после генерации или вы можете написать его сами…"
            placeholderTextColor={colors.slate}
          />
          {errors.text ? <Text style={styles.error}>{errors.text}</Text> : null}
          <Text style={styles.charCount}>{text.length} символов</Text>
        </View>

        <View style={styles.section}>
          <DateTimePicker
            label="Дата и время публикации"
            value={scheduledDate}
            onChange={setScheduledDate}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Сохранить черновик"
            onPress={handleSavePress}
            variant="secondary"
            loading={loading}
            style={styles.actionBtn}
          />
          <Button
            title="Запланировать"
            onPress={handleSchedulePress}
            loading={scheduling}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      <PostPreview
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirm}
        text={text}
        platform={platform}
        topic={topic}
        scheduledDate={previewAction === 'schedule' ? scheduledDate : undefined}
        confirmLabel={previewAction === 'save' ? 'Сохранить черновик' : 'Запланировать'}
        loading={loading || scheduling}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  tones: {
    flexDirection: 'row',
  },
  toneBtn: {
    marginRight: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
  },
  toneBtnText: {
    fontSize: fontSize.sm,
  },
  platforms: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  platformBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.ghost,
    backgroundColor: colors.white,
    gap: spacing.xs,
  },
  platformIcon: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.ink,
  },
  platformIconSelected: {
    color: colors.white,
  },
  platformLabel: {
    fontSize: fontSize.xs,
    color: colors.slate,
    fontWeight: '500',
  },
  platformLabelSelected: {
    color: colors.white,
  },
  generateBtn: {
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.coral,
    borderRadius: radius.sm,
  },
  textArea: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ghost,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.ink,
    minHeight: 180,
  },
  textAreaError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  charCount: {
    fontSize: fontSize.xs,
    color: colors.slate,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});

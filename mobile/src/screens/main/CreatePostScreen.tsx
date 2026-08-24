import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { api, Post, ApiError } from '../../api/client';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { LoadingScreen } from '../../components/States';
import { colors, fontSize, radius, spacing } from '../../theme';

const TONES = [
  { value: 'friendly', label: 'Дружелюбный' },
  { value: 'expert', label: 'Экспертный' },
  { value: 'selling', label: 'Продающий' },
  { value: 'casual', label: 'Неформальный' },
  { value: 'formal', label: 'Официальный' },
];

export function CreatePostScreen({ navigation, route }: any) {
  const postId = route?.params?.postId;
  const isEditing = !!postId;

  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('friendly');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  async function handleSave() {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEditing) {
        await api.updatePost(postId, { text, topic, tone });
      } else {
        await api.createPost({ text, topic, tone });
      }
      Alert.alert('Готово', isEditing ? 'Пост обновлён' : 'Черновик сохранён');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Ошибка', err instanceof ApiError ? err.message : 'Не удалось сохранить');
    } finally {
      setLoading(false);
    }
  }

  async function handleSchedule() {
    if (!validate()) return;

    // For simplicity, schedule for tomorrow at 12:00
    // In a real app, show a date/time picker
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);

    setScheduling(true);
    try {
      let targetId = postId;
      if (!isEditing) {
        const post = await api.createPost({ text, topic, tone });
        targetId = post.id;
      } else {
        await api.updatePost(postId, { text, topic, tone });
      }
      await api.schedulePost(targetId, tomorrow.toISOString());
      Alert.alert(
        'Запланировано',
        `Пост будет опубликован ${tomorrow.toLocaleDateString('ru-RU')} в 12:00`
      );
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

        <View style={styles.actions}>
          <Button
            title="Сохранить черновик"
            onPress={handleSave}
            variant="secondary"
            loading={loading}
            style={styles.actionBtn}
          />
          <Button
            title="Запланировать"
            onPress={handleSchedule}
            loading={scheduling}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
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

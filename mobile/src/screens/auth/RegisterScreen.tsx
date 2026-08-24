import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { colors, fontSize, spacing } from '../../theme';

export function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Введите имя';
    if (!email.trim()) e.email = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Некорректный email';
    if (!password) e.password = 'Введите пароль';
    else if (password.length < 6) e.password = 'Минимум 6 символов';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Не удалось зарегистрироваться.';
      Alert.alert('Ошибка', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size={40} />
          <Text style={styles.subtitle}>Создайте аккаунт</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Имя"
            value={name}
            onChangeText={setName}
            error={errors.name}
            placeholder="Как вас зовут"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <Input
            label="Пароль"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            placeholder="Минимум 6 символов"
          />
          <Button
            title="Зарегистрироваться"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Уже есть аккаунт? </Text>
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Войти
          </Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  logo: {
    fontSize: fontSize.hero,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  logoDot: {
    color: colors.coral,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.slate,
  },
  form: {
    marginBottom: spacing.xl,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.md,
    color: colors.slate,
  },
  link: {
    fontSize: fontSize.md,
    color: colors.coral,
    fontWeight: '600',
  },
});

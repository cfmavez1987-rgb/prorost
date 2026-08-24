import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const THEME_KEY = 'theme_mode';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  ink: string;
  paper: string;
  coral: string;
  coralHover: string;
  mint: string;
  slate: string;
  ghost: string;
  ghostLight: string;
  white: string;
  black: string;
  error: string;
  success: string;
  warning: string;
  card: string;
  cardBorder: string;
  input: string;
  inputBorder: string;
}

const lightColors: ThemeColors = {
  ink: '#1A1A2E',
  paper: '#FAF8F5',
  coral: '#E8735A',
  coralHover: '#D4603F',
  mint: '#5ABFAD',
  slate: '#6B7280',
  ghost: '#E8E5E1',
  ghostLight: '#F2F0ED',
  white: '#FFFFFF',
  black: '#000000',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  card: '#FFFFFF',
  cardBorder: '#E8E5E1',
  input: '#FFFFFF',
  inputBorder: '#E8E5E1',
};

const darkColors: ThemeColors = {
  ink: '#F0EDE8',
  paper: '#121218',
  coral: '#E8735A',
  coralHover: '#F08A72',
  mint: '#5ABFAD',
  slate: '#9CA3AF',
  ghost: '#2A2A3A',
  ghostLight: '#1E1E2A',
  white: '#1A1A2E',
  black: '#FFFFFF',
  error: '#F87171',
  success: '#4ADE80',
  warning: '#FBBF24',
  card: '#1E1E2A',
  cardBorder: '#2A2A3A',
  input: '#1E1E2A',
  inputBorder: '#2A2A3A',
};

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const storage = Platform.OS === 'web' ? {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => { localStorage.setItem(key, value); return Promise.resolve(); },
} : AsyncStorage;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    storage.getItem(THEME_KEY).then(saved => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    storage.setItem(THEME_KEY, newMode);
  };

  const isDark = mode === 'system'
    ? systemScheme === 'dark'
    : mode === 'dark';

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// Экспортируем цвета по умолчанию для обратной совместимости
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  hero: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
} as const;

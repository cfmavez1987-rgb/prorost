import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/theme';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { MainNavigator } from './src/navigation/MainNavigator';
import { LoadingScreen } from './src/components/States';
import { notifications } from './src/services/notifications';
import { StatusBar } from 'expo-status-bar';

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      notifications.init();
      notifications.requestPermission();
    }
  }, [isAuthenticated]);

  if (isLoading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

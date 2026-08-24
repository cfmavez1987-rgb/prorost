import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { FeedScreen } from '../screens/main/FeedScreen';
import { CreatePostScreen } from '../screens/main/CreatePostScreen';
import { AnalyticsScreen } from '../screens/main/AnalyticsScreen';
import { SocialAccountsScreen } from '../screens/main/SocialAccountsScreen';
import { useAuth } from '../context/AuthContext';
import { colors, fontSize } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Feed: '📝',
    Analytics: '📊',
    Social: '🔗',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || '📄'}
    </Text>
  );
}

function FeedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.paper },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="FeedList" component={FeedScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    </Stack.Navigator>
  );
}

export function MainNavigator() {
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: colors.paper, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { color: colors.ink, fontWeight: '600' },
        headerRight: () => (
          <Text
            onPress={logout}
            style={{ color: colors.coral, fontSize: fontSize.sm, marginRight: 16, fontWeight: '500' }}
          >
            Выйти
          </Text>
        ),
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.slate,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.ghost,
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Feed"
        component={FeedStack}
        options={{ title: 'Посты', headerShown: false }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: 'Аналитика' }}
      />
      <Tab.Screen
        name="Social"
        component={SocialAccountsScreen}
        options={{ title: 'Соцсети' }}
      />
    </Tab.Navigator>
  );
}

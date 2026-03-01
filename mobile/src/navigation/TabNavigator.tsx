import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { HoursStackNavigator } from './HoursStackNavigator';
import { LeaderboardScreen } from '../screens/Leaderboard/LeaderboardScreen';
import { EventsStackNavigator } from './EventsStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { AdminUsersScreen } from '../screens/Admin/AdminUsersScreen';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAuthStore } from '../store/authStore';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, { focused: string; unfocused: string }> = {
  Dashboard: { focused: 'home', unfocused: 'home-outline' },
  Hours: { focused: 'time', unfocused: 'time-outline' },
  Leaderboard: { focused: 'trophy', unfocused: 'trophy-outline' },
  Events: { focused: 'calendar', unfocused: 'calendar-outline' },
  Profile: { focused: 'person', unfocused: 'person-outline' },
  AdminUsers: { focused: 'people', unfocused: 'people-outline' },
};

const TAB_LABELS: Record<string, Record<string, string>> = {
  STUDENT: {
    Dashboard: 'Ana Sayfa',
    Hours: 'Saatlerim',
    Leaderboard: 'Sıralama',
    Events: 'Etkinlikler',
    Profile: 'Profil',
  },
  TEACHER: {
    Dashboard: 'Panel',
    Hours: 'Saatler',
    Leaderboard: 'Sıralama',
    Events: 'Etkinlikler',
    Profile: 'Profil',
  },
  ADMIN: {
    Dashboard: 'Yönetim',
    Hours: 'Saatler',
    Leaderboard: 'Sıralama', // Hidden in render if ADMIN, but keeping here just in case
    Events: 'Etkinlikler',
    Profile: 'Profil',
    AdminUsers: 'Üyeler',
  },
};

export function TabNavigator() {
  const colors = useThemeColors();
  const role = useAuthStore((s) => s.user?.role ?? 'STUDENT');
  const labels = TAB_LABELS[role] ?? TAB_LABELS.STUDENT;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          // Provide fallback icon to prevent crashes if name is unexpectedly wrong
          const fallback = { focused: 'list', unfocused: 'list-outline' };
          const safeIcons = icons ?? fallback;
          const iconName = focused ? safeIcons.focused : safeIcons.unfocused;
          return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
        },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: labels.Dashboard }}
      />

      {/* Both Teacher and Admin need to see hours for approval. Student sees their own. */}
      <Tab.Screen
        name="Hours"
        component={HoursStackNavigator}
        options={{ title: labels.Hours, headerShown: false }}
      />

      {/* Admin gets a members tab instead of leaderboard, or as an additional tab. Let's make it conditional instead of Leaderboard for Admin to keep tab count at 5 or 6 */}
      {role === 'ADMIN' ? (
        <Tab.Screen
          name="AdminUsers"
          component={AdminUsersScreen}
          options={{ title: labels.AdminUsers }}
        />
      ) : (
        <Tab.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{ title: labels.Leaderboard }}
        />
      )}

      <Tab.Screen
        name="Events"
        component={EventsStackNavigator}
        options={{ title: labels.Events, headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ title: labels.Profile, headerShown: false }}
      />
    </Tab.Navigator>
  );
}

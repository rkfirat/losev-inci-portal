import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/App/DashboardScreen';
import { CoalitionScreen } from '../screens/App/CoalitionScreen';
import { EventsScreen } from '../screens/Events/EventsScreen';
import { LeaderboardScreen } from '../screens/Leaderboard/LeaderboardScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { CoordinatorScreen } from '../screens/Coordinator/CoordinatorScreen';
import { useAuthStore } from '../store/auth.store';
import { useTheme } from '../store/theme.store';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const { user } = useAuthStore();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          let icon = '';
          if (route.name === 'Dashboard') icon = '🏠';
          else if (route.name === 'Events') icon = '📅';
          else if (route.name === 'Leaderboard') icon = '🏆';
          else if (route.name === 'Coalition') icon = '🛡️';
          else if (route.name === 'Profile') icon = '👤';
          else if (route.name === 'Coordinator') icon = '✅';
          
          return <Text style={{ fontSize: 20 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Ana Sayfa' }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ title: 'Etkinlikler' }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Sıralama' }} />
      <Tab.Screen name="Coalition" component={CoalitionScreen} options={{ title: 'Takım' }} />
      
      {(user?.role === 'ADMIN' || user?.role === 'COORDINATOR') && (
        <Tab.Screen name="Coordinator" component={CoordinatorScreen} options={{ title: 'Onay' }} />
      )}
      
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
};

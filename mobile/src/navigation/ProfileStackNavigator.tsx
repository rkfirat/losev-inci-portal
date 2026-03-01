import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { ProfileEditScreen } from '../screens/Profile/ProfileEditScreen';
import { SettingsScreen } from '../screens/Profile/SettingsScreen';
import { AdminUsersScreen } from '../screens/Admin/AdminUsersScreen';
import { useThemeColors } from '../hooks/useThemeColors';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
  const colors = useThemeColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ title: 'Profili Düzenle' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Ayarlar' }}
      />
      <Stack.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{ title: 'Kullanıcı Yönetimi' }}
      />
    </Stack.Navigator>
  );
}

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { useThemeColors } from '../hooks/useThemeColors';

export function RootNavigator() {
  const { isAuthenticated, logout } = useAuthStore();
  const colors = useThemeColors();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    async function verifyTokens() {
      if (isAuthenticated) {
        try {
          const refreshToken = await SecureStore.getItemAsync('refreshToken');
          if (!refreshToken) {
            // State says authenticated, but tokens are missing (e.g., cleared app data or reinstall)
            // Force logout to clean up state
            logout();
          }
        } catch (e) {
          logout();
        }
      }
      setIsVerifying(false);
    }
    verifyTokens();
  }, [isAuthenticated, logout]);

  if (isVerifying) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return <TabNavigator />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

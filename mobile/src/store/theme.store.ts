import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useTheme = () => {
  const { mode } = useThemeStore();
  const systemColorScheme = useColorScheme();
  
  const currentMode = mode === 'system' ? (systemColorScheme ?? 'light') : mode;
  const isDark = currentMode === 'dark';

  const colors = {
    primary: '#E05A47',
    background: isDark ? '#121212' : '#FAF9F6',
    surface: isDark ? '#1E1E1E' : '#FFFFFF',
    surfaceSecondary: isDark ? '#2C2C2C' : '#F8F9FA',
    text: isDark ? '#FFFFFF' : '#333333',
    textSecondary: isDark ? '#AAAAAA' : '#666666',
    border: isDark ? '#333333' : '#F0F0F0',
    error: '#FF3B30',
    success: '#4CD964',
    cardShadow: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.05)',
  };

  return { colors, isDark, mode };
};

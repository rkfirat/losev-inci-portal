import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Sidebar } from './Sidebar';
import { useTheme } from '../../store/theme.store';

interface Props {
  children: React.ReactNode;
  activeRoute: string;
  navigation: any;
}

export const AppShell: React.FC<Props> = ({ children, activeRoute, navigation }) => {
  const { isDesktop } = useBreakpoint();
  const { colors } = useTheme();

  if (isDesktop && Platform.OS === 'web') {
    return (
      <View style={[styles.webContainer, { backgroundColor: colors.background }]}>
        <Sidebar activeRoute={activeRoute} navigation={navigation} />
        <View style={[styles.mainContent, { backgroundColor: colors.background }]}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.mobileContainer, { backgroundColor: colors.background }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mainContent: {
    flex: 1,
  },
  mobileContainer: {
    flex: 1,
  },
});

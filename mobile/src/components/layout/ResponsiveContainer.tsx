import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useTheme } from '../../store/theme.store';

interface Props {
  children: React.ReactNode;
  stickyHeader?: React.ReactNode;
  fab?: React.ReactNode;
  refreshControl?: React.ReactElement<any>;
}

export const ResponsiveContainer: React.FC<Props> = ({ children, stickyHeader, fab, refreshControl }) => {
  const { isMobile, isDesktop } = useBreakpoint();
  const { colors } = useTheme();

  if (isDesktop) {
    return (
      <View style={[styles.desktopContainer, { backgroundColor: colors.background }]}>
        {stickyHeader}
        <ScrollView 
          contentContainerStyle={styles.desktopScrollContent}
          refreshControl={refreshControl}
        >
          <View style={styles.desktopMainContent}>
            {children}
          </View>
        </ScrollView>
        {fab}
      </View>
    );
  }

  return (
    <View style={[styles.mobileContainer, { backgroundColor: colors.background }]}>
      {stickyHeader}
      <ScrollView 
        contentContainerStyle={styles.mobileScrollContent}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
      {fab}
    </View>
  );
};

const styles = StyleSheet.create({
  mobileContainer: {
    flex: 1,
  },
  mobileScrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  desktopContainer: {
    flex: 1,
  },
  desktopScrollContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  desktopMainContent: {
    width: '100%',
    maxWidth: 1200,
    paddingHorizontal: 40,
  },
});

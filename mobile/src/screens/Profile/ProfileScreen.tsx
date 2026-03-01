import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useThemeColors } from '../../hooks/useThemeColors';
import { typography, spacing, borderRadius } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth';
import { certificateService } from '../../services/certificate';
import { Button } from '../../components/Button';
import { formatDate } from '../../utils/format';
import { Alert } from 'react-native';
import type { ProfileStackScreenProps } from '../../navigation/types';

type Props = ProfileStackScreenProps<'ProfileMain'>;

function ProfileScreenComponent({ navigation }: Props) {
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
    isRefetching,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getMe,
  });

  const displayUser = profile || user;

  const handleNavigate = useCallback(
    (screen: 'ProfileEdit' | 'Settings') => {
      navigation.navigate(screen);
    },
    [navigation],
  );

  const handleDownloadCertificate = useCallback(async () => {
    if (!displayUser) return;
    try {
      await certificateService.generateCertificate({
        fullName: `${displayUser.firstName} ${displayUser.lastName}`,
        totalHours: (displayUser as any).totalHours ?? 0,
        school: displayUser.school ?? undefined,
        startDate: new Date(displayUser.createdAt).toLocaleDateString('tr-TR'),
        endDate: new Date().toLocaleDateString('tr-TR'),
        badgeName: certificateService.getBadgeForHours((displayUser as any).totalHours ?? 0)
      });
    } catch (e) {
      Alert.alert('Hata', 'Sertifika oluşturulurken bir hata oluştu.');
    }
  }, [displayUser]);

  if (profileLoading && !displayUser) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
        testID="profile-screen-loading"
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetchProfile} tintColor={colors.primary} />
      }
      testID="profile-screen"
    >
      {/* User Info Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
          <Text style={[typography.h2, { color: colors.primary }]}>
            {displayUser?.firstName?.[0]?.toUpperCase() ?? '?'}
            {displayUser?.lastName?.[0]?.toUpperCase() ?? ''}
          </Text>
        </View>
        <Text style={[typography.h3, { color: colors.text, marginTop: spacing.sm }]}>
          {displayUser?.firstName} {displayUser?.lastName}
        </Text>
        <Text style={[typography.body2, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          {displayUser?.email}
        </Text>
        {displayUser?.school && (
          <Text style={[typography.body2, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            🎓 {displayUser.school}
          </Text>
        )}
        {displayUser?.phone && (
          <Text style={[typography.body2, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            {displayUser.phone}
          </Text>
        )}
        <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>
            {displayUser?.role === 'STUDENT' ? 'Öğrenci' :
              displayUser?.role === 'TEACHER' ? 'Koordinatör Öğretmen' : 'Genel Merkez'}
          </Text>
        </View>
        <Button
          title="Profili Düzenle"
          onPress={() => handleNavigate('ProfileEdit')}
          variant="outline"
          style={{ marginTop: spacing.md }}
          testID="profile-edit-button"
        />
      </View>

      {/* Menu Items */}
      <View style={[styles.menuSection, { backgroundColor: colors.surface }]}>
        <MenuItem
          icon="document-text-outline"
          label="Sertifika İndir"
          onPress={handleDownloadCertificate}
          colors={colors}
        />
        <MenuItem
          icon="settings-outline"
          label="Ayarlar"
          onPress={() => handleNavigate('Settings')}
          colors={colors}
          testID="profile-settings-menu"
        />
      </View>

      {/* Member Since */}
      {displayUser?.createdAt && (
        <Text
          style={[
            typography.caption,
            { color: colors.textTertiary, textAlign: 'center', marginTop: spacing.lg },
          ]}
        >
          Üye: {formatDate(displayUser.createdAt)}
        </Text>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
  testID?: string;
}

const MenuItem = memo(function MenuItem({ icon, label, onPress, colors, testID }: MenuItemProps) {
  return (
    <View
      style={styles.menuItem}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Button
        title={label}
        onPress={onPress}
        variant="ghost"
        style={{ flex: 1 }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  menuSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export const ProfileScreen = memo(ProfileScreenComponent);

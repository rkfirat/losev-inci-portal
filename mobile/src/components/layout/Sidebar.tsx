import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { AuthService } from '../../services/auth.service';
import { useTheme } from '../../store/theme.store';

interface Props {
  activeRoute: string;
  navigation: any;
}

export const Sidebar: React.FC<Props> = ({ activeRoute, navigation }) => {
  const { user } = useAuthStore();
  const { colors, isDark } = useTheme();

  const navItems = [
    { label: 'Dashboard', route: 'Dashboard', icon: '🏠' },
    { label: 'Gönüllülük Saatleri', route: 'VolunteerHours', icon: '⏱️' },
    { label: 'Rozetler', route: 'Badges', icon: '🎖️' },
    { label: 'Etkinlikler', route: 'Events', icon: '📅' },
    { label: 'Sıralama', route: 'Leaderboard', icon: '🏆' },
    { label: 'Profil', route: 'Profile', icon: '👤' },
    { label: 'Ayarlar', route: 'Settings', icon: '⚙️' },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'COORDINATOR') {
    navItems.splice(4, 0, { label: 'Saat Onaylama', route: 'Coordinator', icon: '✅' });
  }

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: colors.primary }]}>LÖSEV İnci</Text>
      </View>

      <View style={styles.navContainer}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={[
              styles.navItem,
              activeRoute === item.route && { backgroundColor: isDark ? 'rgba(224, 90, 71, 0.15)' : '#FFEBEA' }
            ]}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={[
              styles.navLabel,
              { color: activeRoute === item.route ? colors.primary : colors.textSecondary }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.userProfile}>
           <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
             <Text style={styles.avatarInitial}>{user?.firstName?.[0]}</Text>
           </View>
           <View style={styles.userInfo}>
             <Text style={[styles.userName, { color: colors.text }]}>{user?.firstName}</Text>
             <Text style={[styles.userRole, { color: colors.textSecondary }]}>{user?.role}</Text>
           </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => AuthService.logout()}>
          <Text style={[styles.logoutText, { color: colors.textSecondary }]}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    borderRightWidth: 1,
    height: '100%',
    padding: 20,
    justifyContent: 'space-between',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  navContainer: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  navIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 20,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: 12,
  },
  logoutBtn: {
    padding: 10,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 13,
  }
});

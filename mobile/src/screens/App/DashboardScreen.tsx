import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator, 
  RefreshControl,
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardData, AdminDashboardData } from '../../services/dashboard.service';
import { LineChart } from 'react-native-chart-kit';
import { AppShell } from '../../components/layout/AppShell';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useTheme } from '../../store/theme.store';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export const DashboardScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isDesktop } = useBreakpoint();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);

  const fetchData = async () => {
    try {
      const promises: any[] = [DashboardService.getDashboardData()];
      
      if (user?.role === 'ADMIN' || user?.role === 'COORDINATOR') {
        promises.push(DashboardService.getAdminStats());
      }

      const results = await Promise.all(promises);
      
      if (results[0].success) {
        setData(results[0].data);
      }
      
      if (results[1] && results[1].success) {
        setAdminData(results[1].data);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.role]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    await AuthService.logout();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const getChartData = () => {
    if (!data || data.weeklyHours.length === 0) {
      return {
        labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
      };
    }

    return {
      labels: data.weeklyHours.map(h => new Date(h.date).toLocaleDateString('tr-TR', { weekday: 'short' })),
      datasets: [{ data: data.weeklyHours.map(h => h.hours) }]
    };
  };

  const renderContent = () => (
    <>
      {/* Admin Quick View */}
      {(user?.role === 'ADMIN' || user?.role === 'COORDINATOR') && (
        <View style={styles.adminSection}>
          <View style={styles.adminHeader}>
            <Text style={styles.adminTitle}>{t('dashboard.adminPanel')}</Text>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>{user?.role}</Text>
            </View>
          </View>
          
          <View style={styles.adminStatsRow}>
            <View style={styles.adminStatItem}>
              <Text style={styles.adminStatValue}>{adminData?.pendingHoursCount || 0}</Text>
              <Text style={styles.adminStatLabel}>{t('dashboard.pendingApprovals')}</Text>
            </View>
            <View style={styles.adminStatItem}>
              <Text style={styles.adminStatValue}>{adminData?.activeVolunteersCount || 0}</Text>
              <Text style={styles.adminStatLabel}>{t('dashboard.activeVolunteers')}</Text>
            </View>
            <View style={styles.adminStatItem}>
              <Text style={styles.adminStatValue}>{adminData?.activeEventsCount || 0}</Text>
              <Text style={styles.adminStatLabel}>{t('dashboard.activeEvents')}</Text>
            </View>
          </View>

          <View style={styles.adminGrid}>
            <TouchableOpacity 
              style={styles.adminCard} 
              onPress={() => navigation.navigate('Coordinator')}
            >
              <Text style={styles.adminIcon}>⏳</Text>
              <Text style={styles.adminCardLabel}>{t('admin.onayBekleyenler')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.adminCard} 
              onPress={() => navigation.navigate('AdminVolunteers')}
            >
              <Text style={styles.adminIcon}>👥</Text>
              <Text style={styles.adminCardLabel}>{t('admin.gonulluYonetimi')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.adminCard} 
              onPress={() => navigation.navigate('AdminEvents')}
            >
              <Text style={styles.adminIcon}>📅</Text>
              <Text style={styles.adminCardLabel}>{t('admin.etkinlikOlustur')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.adminCard} 
              onPress={() => navigation.navigate('AdminReports')}
            >
              <Text style={styles.adminIcon}>📊</Text>
              <Text style={styles.adminCardLabel}>{t('admin.sistemRaporlari')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.adminCard} 
              onPress={() => navigation.navigate('AdminAnnouncements')}
            >
              <Text style={styles.adminIcon}>📢</Text>
              <Text style={styles.adminCardLabel}>{t('admin.duyuruGonder')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Header Section (Only on Mobile) */}
      {!isDesktop && (
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{t('dashboard.greeting')}</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.firstName} {user?.lastName}</Text>
          </View>
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.surfaceSecondary }]} onPress={handleLogout}>
            <Text style={[styles.logoutBtnText, { color: colors.textSecondary }]}>{t('common.logout')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {isDesktop && (
        <View style={styles.desktopHeader}>
          <Text style={[styles.desktopTitle, { color: colors.text }]}>{t('dashboard.title')}</Text>
          <Text style={[styles.desktopSubtitle, { color: colors.textSecondary }]}>{t('dashboard.subtitle')}</Text>
        </View>
      )}

      {/* Announcements Section */}
      {data?.announcements && data.announcements.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Duyurular</Text>
          {data.announcements.map((announcement: any) => (
            <View key={announcement.id} style={[styles.announcementCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
              <Text style={[styles.announcementTitle, { color: colors.text }]}>{announcement.title}</Text>
              <Text style={[styles.announcementContent, { color: colors.textSecondary }]}>{announcement.content}</Text>
              <Text style={[styles.announcementDate, { color: colors.textSecondary }]}>
                {new Date(announcement.createdAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={isDesktop ? styles.desktopGrid : styles.mobileStack}>
        <View style={isDesktop ? styles.desktopColMain : styles.mobileCol}>
          <View style={styles.statsRow}>
            <TouchableOpacity 
              style={[styles.statCard, { backgroundColor: colors.surface }]} 
              onPress={() => navigation.navigate(user?.role === 'ADMIN' ? 'AdminReports' : 'VolunteerHours')}
            >
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {user?.role === 'ADMIN' || user?.role === 'COORDINATOR' 
                  ? adminData?.totalSystemHours || 0 
                  : data?.stats.totalHours || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {user?.role === 'ADMIN' || user?.role === 'COORDINATOR' ? 'Sistem Toplam Saat' : 'Toplam Saat'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statCard, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Badges')}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {user?.role === 'ADMIN' || user?.role === 'COORDINATOR' 
                  ? adminData?.totalBadgesAwarded || 0 
                  : data?.stats.badgeCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {user?.role === 'ADMIN' || user?.role === 'COORDINATOR' ? 'Dağıtılan Rozet' : 'Rozet'}
              </Text>
            </TouchableOpacity>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {user?.role === 'ADMIN' || user?.role === 'COORDINATOR' 
                  ? adminData?.activeVolunteersCount || 0 
                  : (data?.stats.rank ? `#${data.stats.rank}` : '-')}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {user?.role === 'ADMIN' || user?.role === 'COORDINATOR' ? 'Sistem Gönüllü' : 'Sıralama'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Haftalık İlerleme</Text>
            <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
              <LineChart
                data={getChartData()}
                width={isDesktop ? 760 : width - 40}
                height={220}
                chartConfig={{
                  backgroundColor: colors.surface,
                  backgroundGradientFrom: colors.surface,
                  backgroundGradientTo: colors.surface,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(224, 90, 71, ${opacity})`,
                  labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(102, 102, 102, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: "4", strokeWidth: "2", stroke: colors.primary }
                }}
                bezier
                style={styles.chart}
              />
            </View>
          </View>

          {isDesktop && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Rozetler</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Badges')}>
                  <Text style={styles.seeAll}>Tümü</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.badgeRow, { backgroundColor: colors.surface }]}>
                {data?.recentBadges && data.recentBadges.length > 0 ? (
                  data.recentBadges.map(badge => (
                    <View key={badge.id} style={styles.badgeItem}>
                      <View style={[styles.badgeCircle, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                        <Text style={styles.badgeIcon}>🎖️</Text>
                      </View>
                      <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={1}>{badge.name}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz rozet kazanılmadı.</Text>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={isDesktop ? styles.desktopColSide : styles.mobileCol}>
          {!isDesktop && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Rozetler</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Badges')}>
                  <Text style={styles.seeAll}>Tümü</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.badgeRow, { backgroundColor: colors.surface }]}>
                {data?.recentBadges && data.recentBadges.length > 0 ? (
                  data.recentBadges.map(badge => (
                    <View key={badge.id} style={styles.badgeItem}>
                      <View style={[styles.badgeCircle, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                        <Text style={styles.badgeIcon}>🎖️</Text>
                      </View>
                      <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={1}>{badge.name}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz rozet kazanılmadı.</Text>
                )}
              </View>
            </View>
          )}

          <View style={[styles.section, { marginBottom: isDesktop ? 0 : 100 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Yaklaşan Etkinlikler</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Events')}>
                <Text style={styles.seeAll}>Tümü</Text>
              </TouchableOpacity>
            </View>
            {data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
              data.upcomingEvents.map(event => (
                <TouchableOpacity key={event.id} style={[styles.eventCard, { backgroundColor: colors.surface }]}>
                  <View style={[styles.eventDateBox, { backgroundColor: isDark ? 'rgba(224, 90, 71, 0.2)' : '#FFEBEA' }]}>
                    <Text style={[styles.eventDateDay, { color: colors.primary }]}>{new Date(event.startDate).getDate()}</Text>
                    <Text style={[styles.eventDateMonth, { color: colors.primary }]}>{new Date(event.startDate).toLocaleDateString('tr-TR', { month: 'short' })}</Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                    <Text style={[styles.eventLocation, { color: colors.textSecondary }]}>{event.location}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Yaklaşan etkinliğiniz bulunmuyor.</Text>
            )}
          </View>
        </View>
      </View>
    </>
  );

  return (
    <AppShell activeRoute="Dashboard" navigation={navigation}>
      <ResponsiveContainer
        fab={!isDesktop ? (
          <TouchableOpacity 
            style={[styles.fab, { backgroundColor: colors.primary }]} 
            onPress={() => navigation.navigate('LogHours')}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        ) : null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        {renderContent()}
      </ResponsiveContainer>
    </AppShell>
  );
};

// ... (Styles stay same)
import { Alert } from 'react-native';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminSection: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    ...Platform.select({
      web: { boxShadow: '0px 10px 30px rgba(0,0,0,0.2)' },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      }
    }),
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  adminTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  adminBadge: {
    backgroundColor: '#E05A47',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adminBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  adminStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  adminStatItem: {
    alignItems: 'center',
  },
  adminStatValue: {
    color: '#E05A47',
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminStatLabel: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },
  adminGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  adminCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: '48%',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  adminIcon: {
    fontSize: 22,
    marginBottom: 10,
  },
  adminCardLabel: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  desktopHeader: {
    marginBottom: 30,
  },
  desktopTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  desktopSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  desktopGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mobileStack: {
    flexDirection: 'column',
  },
  desktopColMain: {
    flex: 2,
    marginRight: 30,
  },
  desktopColSide: {
    flex: 1,
  },
  mobileCol: {
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  seeAll: {
    fontSize: 14,
    color: '#E05A47',
    fontWeight: '600',
  },
  chartCard: {
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 15,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  badgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeName: {
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 70,
  },
  eventCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  eventDateBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventDateDay: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDateMonth: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  eventLocation: {
    fontSize: 13,
    marginTop: 2,
  },
  announcementCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  announcementContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  announcementDate: {
    fontSize: 11,
    textAlign: 'right',
  },
  emptyText: {
    fontStyle: 'italic',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#E05A47",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
  }
});
import { Platform } from 'react-native';

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  Image 
} from 'react-native';
import { LeaderboardService, LeaderboardUser } from '../../services/leaderboard.service';
import { AppShell } from '../../components/layout/AppShell';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export const LeaderboardScreen = ({ navigation }: any) => {
  const { isDesktop } = useBreakpoint();
  const [volunteers, setVolunteers] = useState<LeaderboardUser[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const res = await LeaderboardService.getLeaderboard();
      if (res.success) {
        setVolunteers(res.data.volunteers);
        setMyRank(res.data.myRank);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const renderPodium = () => {
    const top3 = volunteers.slice(0, 3);
    if (top3.length === 0) return null;

    return (
      <View style={styles.podiumContainer}>
        {/* 2nd Place */}
        {top3[1] && (
          <View style={[styles.podiumItem, styles.podium2]}>
            <View style={styles.podiumAvatarContainer}>
              <View style={[styles.podiumAvatar, { borderColor: '#C0C0C0' }]}>
                <Text style={styles.podiumAvatarText}>{top3[1].firstName[0]}</Text>
              </View>
              <View style={[styles.rankBadge, { backgroundColor: '#C0C0C0' }]}>
                <Text style={styles.rankBadgeText}>2</Text>
              </View>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{top3[1].firstName}</Text>
            <Text style={styles.podiumHours}>{top3[1].totalHours} Saat</Text>
          </View>
        )}

        {/* 1st Place */}
        {top3[0] && (
          <View style={[styles.podiumItem, styles.podium1]}>
            <View style={styles.podiumAvatarContainer}>
              <View style={[styles.podiumAvatar, { borderColor: '#FFD700', width: 80, height: 80, borderRadius: 40 }]}>
                <Text style={[styles.podiumAvatarText, { fontSize: 32 }]}>{top3[0].firstName[0]}</Text>
              </View>
              <View style={[styles.rankBadge, { backgroundColor: '#FFD700', top: -5 }]}>
                <Text style={styles.rankBadgeText}>1</Text>
              </View>
            </View>
            <Text style={[styles.podiumName, { fontWeight: 'bold' }]} numberOfLines={1}>{top3[0].firstName}</Text>
            <Text style={[styles.podiumHours, { color: '#E05A47', fontWeight: 'bold' }]}>{top3[0].totalHours} Saat</Text>
          </View>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <View style={[styles.podiumItem, styles.podium3]}>
            <View style={styles.podiumAvatarContainer}>
              <View style={[styles.podiumAvatar, { borderColor: '#CD7F32' }]}>
                <Text style={styles.podiumAvatarText}>{top3[2].firstName[0]}</Text>
              </View>
              <View style={[styles.rankBadge, { backgroundColor: '#CD7F32' }]}>
                <Text style={styles.rankBadgeText}>3</Text>
              </View>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{top3[2].firstName}</Text>
            <Text style={styles.podiumHours}>{top3[2].totalHours} Saat</Text>
          </View>
        )}
      </View>
    );
  };

  const renderUserRow = ({ item, index }: { item: LeaderboardUser, index: number }) => {
    // Skip top 3 as they are in the podium
    if (index < 3) return null;

    return (
      <View style={styles.userRow}>
        <Text style={styles.userRank}>{index + 1}</Text>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{item.firstName[0]}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.userSchool}>{item.school || '42 Istanbul'}</Text>
        </View>
        <View style={styles.userStats}>
          <Text style={styles.userHours}>{item.totalHours} <Text style={styles.hourLabel}>s</Text></Text>
          <Text style={styles.userBadges}>🎖️ {item.badgeCount}</Text>
        </View>
      </View>
    );
  };

  return (
    <AppShell activeRoute="Leaderboard" navigation={navigation}>
      <ResponsiveContainer>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Sıralama</Text>
          <Text style={styles.subtitle}>En aktif gönüllülerimiz arasındasın!</Text>
        </View>

        {loading && volunteers.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#E05A47" />
          </View>
        ) : (
          <View style={isDesktop ? styles.desktopLayout : styles.mobileLayout}>
            {/* My Rank Info */}
            {myRank && (
              <View style={styles.myRankCard}>
                <Text style={styles.myRankLabel}>Senin Sıralaman</Text>
                <Text style={styles.myRankValue}>#{myRank}</Text>
              </View>
            )}

            {renderPodium()}

            <View style={[styles.listCard, isDesktop && styles.desktopListCard]}>
              <FlatList
                data={volunteers}
                keyExtractor={(item) => item.id}
                renderItem={renderUserRow}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#E05A47"]} tintColor="#E05A47" />}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Henüz kimse sıralamaya girmemiş.</Text>
                  </View>
                }
              />
            </View>
          </View>
        )}
      </ResponsiveContainer>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  center: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopLayout: {
    width: '100%',
    alignItems: 'center',
  },
  mobileLayout: {
    width: '100%',
  },
  myRankCard: {
    backgroundColor: '#E05A47',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
    maxWidth: 600,
  },
  myRankLabel: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  myRankValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 220,
    marginBottom: 40,
    width: '100%',
  },
  podiumItem: {
    alignItems: 'center',
    width: 100,
  },
  podium1: {
    zIndex: 2,
    marginHorizontal: -10,
  },
  podium2: {
    zIndex: 1,
  },
  podium3: {
    zIndex: 1,
  },
  podiumAvatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  rankBadge: {
    position: 'absolute',
    top: -10,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  rankBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  podiumName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  podiumHours: {
    fontSize: 12,
    color: '#888',
  },
  listCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 800,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  desktopListCard: {
    marginBottom: 40,
  },
  listContent: {
    padding: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  userRank: {
    width: 30,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userAvatarText: {
    color: '#E05A47',
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userSchool: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  userStats: {
    alignItems: 'flex-end',
  },
  userHours: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  hourLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'normal',
  },
  userBadges: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    fontStyle: 'italic',
  }
});

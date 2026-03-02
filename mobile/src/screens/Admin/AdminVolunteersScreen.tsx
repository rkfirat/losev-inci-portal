import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl
} from 'react-native';
import { AdminService } from '../../services/admin.service';
import { AppShell } from '../../components/layout/AppShell';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useTheme } from '../../store/theme.store';

export const AdminVolunteersScreen = ({ navigation }: any) => {
  const { isDesktop } = useBreakpoint();
  const { colors, isDark } = useTheme();
  
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchVolunteers = async (pageToFetch: number, isRefresh: boolean) => {
    try {
      const res = await AdminService.getVolunteers(pageToFetch, search);
      if (res.success) {
        if (isRefresh) {
          setVolunteers(res.data);
        } else {
          setVolunteers(prev => [...prev, ...res.data]);
        }
        setHasMore(res.meta.page < res.meta.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch volunteers', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchVolunteers(1, true);
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchVolunteers(1, true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await AdminService.toggleUserStatus(id);
      if (res.success) {
        setVolunteers(prev => prev.map(v => v.id === id ? { ...v, isActive: !v.isActive } : v));
      }
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcı durumu güncellenemedi.');
    }
  };

  const renderVolunteerItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderLeftColor: item.isActive ? colors.success : colors.error }]}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{item.firstName[0]}</Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: colors.text }]}>{item.firstName} {item.lastName}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.isActive ? 'rgba(76, 217, 100, 0.1)' : 'rgba(255, 59, 48, 0.1)' }]}>
          <Text style={[styles.statusText, { color: item.isActive ? colors.success : colors.error }]}>
            {item.isActive ? 'Aktif' : 'Pasif'}
          </Text>
        </View>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{item._count.volunteerHours}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Onaylı Saat</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{item._count.volunteerBadges}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rozet</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{item.school || '42 IST'}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Okul</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => handleToggleStatus(item.id)}
        >
          <Text style={[styles.actionBtnText, { color: item.isActive ? colors.error : colors.success }]}>
            {item.isActive ? 'Deaktive Et' : 'Aktifleştir'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => Alert.alert('Detay', 'Kullanıcı detay sayfası yakında!')}
        >
          <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Detayları Gör</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <AppShell activeRoute="AdminVolunteers" navigation={navigation}>
      <ResponsiveContainer>
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Gönüllü Yönetimi</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Tüm gönüllüleri listeleyin ve durumlarını yönetin</Text>
        </View>

        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="İsim veya e-posta ile ara..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {loading && volunteers.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={volunteers}
            keyExtractor={(item) => item.id}
            renderItem={renderVolunteerItem}
            numColumns={isDesktop ? 2 : 1}
            key={isDesktop ? 'desktop' : 'mobile'}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
            onEndReached={() => hasMore && setPage(p => p + 1)}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Gönüllü bulunamadı.</Text>
              </View>
            }
          />
        )}
      </ResponsiveContainer>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 25,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 25,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  center: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    margin: 8,
    flex: 1,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  }
});

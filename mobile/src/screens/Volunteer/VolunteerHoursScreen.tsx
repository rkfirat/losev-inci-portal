import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, SafeAreaView, TouchableOpacity } from 'react-native';
import { VolunteerService, VolunteerHour } from '../../services/volunteer.service';
import { AppShell } from '../../components/layout/AppShell';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export const VolunteerHoursScreen = ({ navigation }: any) => {
  const { isDesktop } = useBreakpoint();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hours, setHours] = useState<VolunteerHour[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchHours = async (pageToFetch: number, isRefresh: boolean) => {
    try {
      const res = await VolunteerService.getMyHours(pageToFetch);
      if (res.success) {
        if (isRefresh) {
          setHours(res.data);
        } else {
          setHours(prev => [...prev, ...res.data]);
        }
        setHasMore(res.meta.page < res.meta.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch volunteer hours', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHours(1, true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchHours(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHours(nextPage, false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#4CD964';
      case 'REJECTED': return '#FF3B30';
      default: return '#FF9500'; // PENDING
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Onaylandı';
      case 'REJECTED': return 'Reddedildi';
      default: return 'Beklemede';
    }
  };

  const renderItem = ({ item }: { item: VolunteerHour }) => (
    <View style={[styles.card, isDesktop && styles.desktopCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.projectName}>{item.projectName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Süre:</Text>
          <Text style={styles.infoValue}>{item.hours} Saat</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tarih:</Text>
          <Text style={styles.infoValue}>{new Date(item.date).toLocaleDateString('tr-TR')}</Text>
        </View>
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        )}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {!isDesktop && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.pageTitle}>Saat Geçmişi</Text>
      <Text style={styles.subtitle}>Tüm gönüllülük faaliyetlerinizi takip edin</Text>
    </View>
  );

  return (
    <AppShell activeRoute="VolunteerHours" navigation={navigation}>
      <ResponsiveContainer>
        {renderHeader()}

        {loading && hours.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#E05A47" />
          </View>
        ) : (
          <FlatList
            data={hours}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={isDesktop ? 2 : 1}
            key={isDesktop ? 'desktop' : 'mobile'}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#E05A47"]} tintColor="#E05A47" />}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz bir saat kaydı bulunmuyor.</Text>
              </View>
            }
            ListFooterComponent={hasMore ? <ActivityIndicator style={{ margin: 20 }} color="#E05A47" /> : null}
          />
        )}
      </ResponsiveContainer>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    marginBottom: 30,
  },
  backBtn: {
    marginBottom: 15,
  },
  backBtnText: {
    color: '#E05A47',
    fontWeight: '600',
    fontSize: 16,
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
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  desktopCard: {
    flex: 1,
    marginHorizontal: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    width: 60,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});


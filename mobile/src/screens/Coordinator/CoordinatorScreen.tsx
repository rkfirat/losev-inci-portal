import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { CoordinatorService } from '../../services/coordinator.service';
import { AppShell } from '../../components/layout/AppShell';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export const CoordinatorScreen = ({ navigation }: any) => {
  const { isDesktop } = useBreakpoint();
  const [pendingHours, setPendingHours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPendingHours = async () => {
    try {
      const res = await CoordinatorService.getPendingHours();
      if (res.success) {
        setPendingHours(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch pending hours', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingHours();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingHours();
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(id);
    try {
      const res = await CoordinatorService.updateHourStatus(id, status);
      if (res.success) {
        setPendingHours(prev => prev.filter(h => h.id !== id));
      }
    } catch (error) {
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
    } finally {
      setActionLoading(null);
    }
  };

  const renderHourItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.user.firstName[0]}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.user.firstName} {item.user.lastName}</Text>
            <Text style={styles.projectName}>{item.projectName}</Text>
          </View>
        </View>
        <Text style={styles.hoursValue}>{item.hours} s</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.dateLabel}>Tarih: <Text style={styles.dateValue}>{new Date(item.date).toLocaleDateString('tr-TR')}</Text></Text>
        {item.description && <Text style={styles.description}>{item.description}</Text>}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.rejectBtn]} 
          onPress={() => handleUpdateStatus(item.id, 'REJECTED')}
          disabled={!!actionLoading}
        >
          <Text style={styles.rejectBtnText}>Reddet</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.approveBtn]} 
          onPress={() => handleUpdateStatus(item.id, 'APPROVED')}
          disabled={!!actionLoading}
        >
          {actionLoading === item.id ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.approveBtnText}>Onayla</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <AppShell activeRoute="Coordinator" navigation={navigation}>
      <ResponsiveContainer>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Saat Onaylama</Text>
          <Text style={styles.subtitle}>Gönüllülerin girdiği saatleri inceleyin ve onaylayın</Text>
        </View>

        {loading && pendingHours.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#E05A47" />
          </View>
        ) : (
          <FlatList
            data={pendingHours}
            keyExtractor={(item) => item.id}
            renderItem={renderHourItem}
            numColumns={isDesktop ? 2 : 1}
            key={isDesktop ? 'desktop' : 'mobile'}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#E05A47"]} tintColor="#E05A47" />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Bekleyen saat kaydı bulunmuyor.</Text>
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
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    margin: 8,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#E05A47',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  projectName: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  hoursValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E05A47',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
    paddingTop: 15,
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 13,
    color: '#888',
  },
  dateValue: {
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
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  approveBtn: {
    backgroundColor: '#4CD964',
  },
  rejectBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  approveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  rejectBtnText: {
    color: '#FF3B30',
    fontWeight: 'bold',
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

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  Alert,
  Platform
} from 'react-native';
import { EventService, EventData } from '../../services/event.service';
import { AppShell } from '../../components/layout/AppShell';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export const EventDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const { isDesktop } = useBreakpoint();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEventDetail = async () => {
    try {
      const res = await EventService.getEventById(id);
      if (res.success) {
        setEvent(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch event detail', error);
      Alert.alert('Hata', 'Etkinlik detayları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const handleParticipate = async () => {
    setActionLoading(true);
    try {
      const res = await EventService.participate(id);
      if (res.success) {
        Alert.alert('Başarılı', 'Etkinliğe kaydınız yapıldı!');
        fetchEventDetail();
      }
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || 'Bir hata oluştu.';
      Alert.alert('Hata', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelParticipation = async () => {
    setActionLoading(true);
    try {
      const res = await EventService.cancelParticipation(id);
      if (res.success) {
        Alert.alert('Bilgi', 'Katılımınız iptal edildi.');
        fetchEventDetail();
      }
    } catch (error: any) {
      Alert.alert('Hata', 'İptal işlemi başarısız oldu.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E05A47" />
      </View>
    );
  }

  if (!event) return null;

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const renderInfo = () => (
    <View style={styles.infoSection}>
      <Text style={styles.title}>{event.title}</Text>
      
      <View style={styles.detailsBox}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📅</Text>
          <View>
            <Text style={styles.detailLabel}>Tarih</Text>
            <Text style={styles.detailValue}>
              {startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>⏰</Text>
          <View>
            <Text style={styles.detailLabel}>Saat</Text>
            <Text style={styles.detailValue}>
              {startDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📍</Text>
          <View>
            <Text style={styles.detailLabel}>Lokasyon</Text>
            <Text style={styles.detailValue}>{event.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.descriptionBox}>
        <Text style={styles.sectionTitle}>Hakkında</Text>
        <Text style={styles.description}>{event.description || 'Bu etkinlik için açıklama bulunmuyor.'}</Text>
      </View>
    </View>
  );

  const renderRSVP = () => (
    <View style={styles.rsvpCard}>
      <Text style={styles.rsvpTitle}>Katılım Durumu</Text>
      
      <View style={styles.capacityInfo}>
        <Text style={styles.capacityLabel}>Kontenjan</Text>
        <Text style={styles.capacityValue}>
          {event._count.participants} / {event.capacity || '∞'}
        </Text>
      </View>

      {event.isUserParticipating ? (
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleCancelParticipation}
          disabled={actionLoading}
        >
          <Text style={styles.cancelButtonText}>Katılımı İptal Et</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleParticipate}
          disabled={actionLoading || !!(event.capacity && event._count.participants >= event.capacity)}
        >
          {actionLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Etkinliğe Katıl</Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.guestListSection}>
        <Text style={styles.guestListTitle}>Katılanlar ({event._count.participants})</Text>
        <View style={styles.guestGrid}>
          {event.participants.filter(p => p.status !== 'CANCELLED').map((p, i) => (
            <View key={i} style={styles.guestItem}>
              <View style={styles.guestAvatar}>
                <Text style={styles.guestInitial}>{p.user.firstName[0]}</Text>
              </View>
              <Text style={styles.guestName} numberOfLines={1}>{p.user.firstName}</Text>
            </View>
          ))}
          {event._count.participants === 0 && (
            <Text style={styles.emptyGuestText}>Henüz kimse katılmadı. İlk sen ol!</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <AppShell activeRoute="Events" navigation={navigation}>
      <ResponsiveContainer>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Geri Dön</Text>
        </TouchableOpacity>

        <Image 
          source={{ uri: event.imageUrl || 'https://via.placeholder.com/1200x600/E05A47/FFFFFF?text=LÖSEV+Etkinlik' }} 
          style={styles.heroImage as any} 
        />

        <View style={isDesktop ? styles.desktopLayout : styles.mobileLayout}>
          <View style={isDesktop ? styles.desktopMain : styles.mobileMain}>
            {renderInfo()}
          </View>
          <View style={isDesktop ? styles.desktopSide : styles.mobileSide}>
            {renderRSVP()}
          </View>
        </View>
      </ResponsiveContainer>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    marginBottom: 20,
  },
  backBtnText: {
    color: '#E05A47',
    fontSize: 16,
    fontWeight: '600',
  },
  heroImage: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    marginBottom: 30,
  },
  desktopLayout: {
    flexDirection: 'row',
  },
  mobileLayout: {
    flexDirection: 'column',
  },
  desktopMain: {
    flex: 2,
    marginRight: 40,
  },
  desktopSide: {
    flex: 1,
  },
  mobileMain: {
    width: '100%',
  },
  mobileSide: {
    width: '100%',
    marginTop: 30,
  },
  infoSection: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
  },
  detailsBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    ...Platform.select({
      web: { boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)' } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      }
    }),
    elevation: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginTop: 2,
  },
  descriptionBox: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: '#555',
  },
  rsvpCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    ...Platform.select({
      web: { boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)' } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      }
    }),
    elevation: 5,
    position: (Platform.OS === 'web' ? 'sticky' : 'relative') as any,
    top: Platform.OS === 'web' ? 20 : 0,
  },
  rsvpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  capacityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  capacityLabel: {
    fontSize: 14,
    color: '#666',
  },
  capacityValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#E05A47',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestListSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 20,
  },
  guestListTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  guestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  guestItem: {
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 15,
    width: 50,
  },
  guestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  guestInitial: {
    color: '#E05A47',
    fontWeight: 'bold',
    fontSize: 14,
  },
  guestName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  emptyGuestText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  }
});

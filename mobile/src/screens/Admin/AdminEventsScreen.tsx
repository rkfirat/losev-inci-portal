import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  Image,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { AdminService } from '../../services/admin.service';
import { EventService } from '../../services/event.service';
import { AppShell } from '../../components/layout/AppShell';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useTheme } from '../../store/theme.store';

export const AdminEventsScreen = ({ navigation }: any) => {
  const { isDesktop } = useBreakpoint();
  const { colors, isDark } = useTheme();
  
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    capacity: '',
  });

  const fetchEvents = async () => {
    try {
      const res = await EventService.getAllEvents();
      if (res.success) {
        setEvents(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const openEditModal = (event: any) => {
    setEditingEventId(event.id);
    setFormData({
      title: event.title,
      description: event.description || '',
      location: event.location,
      startDate: new Date(event.startDate).toISOString().slice(0, 16).replace('T', ' '),
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16).replace('T', ' ') : '',
      capacity: event.capacity ? event.capacity.toString() : '',
    });
    setModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingEventId(null);
    setFormData({ title: '', description: '', location: '', startDate: '', endDate: '', capacity: '' });
    setModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (!formData.title || !formData.location || !formData.startDate) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate || formData.startDate).toISOString(),
      };

      let res;
      if (editingEventId) {
        res = await AdminService.updateEvent(editingEventId, payload);
      } else {
        res = await AdminService.createEvent(payload);
      }

      if (res.success) {
        Alert.alert('Başarılı', editingEventId ? 'Etkinlik güncellendi.' : 'Etkinlik oluşturuldu.');
        setModalVisible(false);
        fetchEvents();
      }
    } catch (error) {
      Alert.alert('Hata', editingEventId ? 'Etkinlik güncellenemedi.' : 'Etkinlik oluşturulamadı.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    Alert.alert(
      'Etkinliği Sil',
      'Bu etkinliği silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await AdminService.deleteEvent(id);
              if (res.success) {
                fetchEvents();
              }
            } catch (error) {
              Alert.alert('Hata', 'Etkinlik silinemedi.');
            }
          }
        }
      ]
    );
  };

  const renderEventItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/150/E05A47/FFFFFF?text=LÖSEV' }} 
          style={styles.eventThumb} 
        />
        <View style={styles.eventMainInfo}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.eventMeta, { color: colors.textSecondary }]}>📍 {item.location}</Text>
          <Text style={[styles.eventMeta, { color: colors.textSecondary }]}>📅 {new Date(item.startDate).toLocaleDateString('tr-TR')}</Text>
        </View>
        <View style={styles.eventStats}>
          <Text style={[styles.participantCount, { color: colors.primary }]}>{item._count?.participants || 0}</Text>
          <Text style={[styles.participantLabel, { color: colors.textSecondary }]}>Katılımcı</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => openEditModal(item)}
        >
          <Text style={[styles.actionBtnText, { color: colors.text }]}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}
          onPress={() => handleDeleteEvent(item.id)}
        >
          <Text style={[styles.actionBtnText, { color: colors.error }]}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <AppShell activeRoute="AdminEvents" navigation={navigation}>
      <ResponsiveContainer>
        <View style={styles.header}>
          <View>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Etkinlik Yönetimi</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Portal üzerindeki tüm etkinlikleri yönetin</Text>
          </View>
          <TouchableOpacity 
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
            onPress={openCreateModal}
          >
            <Text style={styles.createBtnText}>+ Yeni Etkinlik</Text>
          </TouchableOpacity>
        </View>

        {loading && events.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={renderEventItem}
            numColumns={isDesktop ? 2 : 1}
            key={isDesktop ? 'desktop' : 'mobile'}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz etkinlik bulunmuyor.</Text>
              </View>
            }
          />
        )}

        {/* Event Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <ScrollView>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingEventId ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Oluştur'}
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Etkinlik Başlığı *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Başlık girin..."
                    placeholderTextColor={colors.textSecondary}
                    value={formData.title}
                    onChangeText={(val) => setFormData({...formData, title: val})}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Lokasyon *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Örn: 42 İstanbul"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.location}
                    onChangeText={(val) => setFormData({...formData, location: val})}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Başlangıç Tarihi (YYYY-MM-DD HH:MM) *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="2024-03-15 14:00"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.startDate}
                    onChangeText={(val) => setFormData({...formData, startDate: val})}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Açıklama</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, height: 80 }]}
                    placeholder="Etkinlik detayları..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    value={formData.description}
                    onChangeText={(val) => setFormData({...formData, description: val})}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalBtn, styles.cancelBtn]} 
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelBtnText}>Vazgeç</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalBtn, { backgroundColor: colors.primary }]} 
                    onPress={handleSaveEvent}
                  >
                    <Text style={styles.createBtnText}>
                      {editingEventId ? 'Güncelle' : 'Kaydet'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ResponsiveContainer>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
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
    padding: 15,
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
    alignItems: 'center',
    marginBottom: 15,
  },
  eventThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  eventMainInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventMeta: {
    fontSize: 12,
  },
  eventStats: {
    alignItems: 'center',
    paddingLeft: 10,
  },
  participantCount: {
    fontSize: 18,
    fontWeight: '800',
  },
  participantLabel: {
    fontSize: 10,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    height: 36,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 24,
    padding: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 10,
  },
  cancelBtn: {
    backgroundColor: '#EEE',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: 'bold',
  }
});

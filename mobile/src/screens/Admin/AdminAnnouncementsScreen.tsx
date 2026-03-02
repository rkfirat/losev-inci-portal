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
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { AdminService } from '../../services/admin.service';
import { DashboardService } from '../../services/dashboard.service';
import { AppShell } from '../../components/layout/AppShell';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useTheme } from '../../store/theme.store';

export const AdminAnnouncementsScreen = ({ navigation }: any) => {
  const { isDesktop } = useBreakpoint();
  const { colors, isDark } = useTheme();
  
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: '' as any, // Default to all
  });

  const fetchAnnouncements = async () => {
    try {
      // In a real app, we might have a dedicated list announcements for admin
      // For now, we'll use the ones from dashboard data or assume they come from a list
      const res = await DashboardService.getDashboardData();
      if (res.success) {
        setAnnouncements(res.data.announcements || []);
      }
    } catch (error) {
      console.error('Failed to fetch announcements', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const openCreateModal = () => {
    setFormData({ title: '', content: '', targetRole: null });
    setModalVisible(true);
  };

  const handleSendAnnouncement = async () => {
    if (!formData.title || !formData.content) {
      Alert.alert('Hata', 'Lütfen başlık ve içerik alanlarını doldurun.');
      return;
    }

    try {
      const res = await AdminService.sendAnnouncement(formData);

      if (res.success) {
        Alert.alert('Başarılı', 'Duyuru başarıyla gönderildi.');
        setModalVisible(false);
        fetchAnnouncements();
      }
    } catch (error) {
      Alert.alert('Hata', 'Duyuru gönderilemedi.');
    }
  };

  const renderAnnouncementItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
      <View style={styles.cardHeader}>
        <View style={styles.announcementInfo}>
          <Text style={[styles.announcementTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.announcementMeta, { color: colors.textSecondary }]}>
            📅 {new Date(item.createdAt).toLocaleDateString('tr-TR')} 
            {item.targetRole ? ` • 🎯 ${item.targetRole}` : ' • 🌍 Herkese'}
          </Text>
          <Text style={[styles.announcementBody, { color: colors.textSecondary }]} numberOfLines={3}>
            {item.content}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <AppShell activeRoute="AdminAnnouncements" navigation={navigation}>
      <ResponsiveContainer>
        <View style={styles.header}>
          <View>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Duyuru Yönetimi</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Tüm kullanıcılara veya belirli rollere duyuru gönderin</Text>
          </View>
          <TouchableOpacity 
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
            onPress={openCreateModal}
          >
            <Text style={styles.createBtnText}>+ Yeni Duyuru</Text>
          </TouchableOpacity>
        </View>

        {loading && announcements.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={announcements}
            keyExtractor={(item) => item.id}
            renderItem={renderAnnouncementItem}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz duyuru bulunmuyor.</Text>
              </View>
            }
          />
        )}

        {/* Announcement Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <ScrollView>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Yeni Duyuru Gönder</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Duyuru Başlığı *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Başlık girin..."
                    placeholderTextColor={colors.textSecondary}
                    value={formData.title}
                    onChangeText={(val) => setFormData({...formData, title: val})}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Hedef Kitle</Text>
                  <View style={styles.rolePicker}>
                    {['ALL', 'VOLUNTEER', 'COORDINATOR', 'ADMIN'].map((role) => (
                      <TouchableOpacity 
                        key={role}
                        style={[
                          styles.roleBtn, 
                          { borderColor: colors.border },
                          (formData.targetRole === (role === 'ALL' ? null : role)) && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => setFormData({...formData, targetRole: role === 'ALL' ? null : role})}
                      >
                        <Text style={[
                          styles.roleBtnText, 
                          { color: colors.text },
                          (formData.targetRole === (role === 'ALL' ? null : role)) && { color: '#FFF' }
                        ]}>
                          {role === 'ALL' ? 'Herkes' : role}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Duyuru İçeriği *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, height: 120 }]}
                    placeholder="Duyuru içeriğini buraya yazın..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    textAlignVertical="top"
                    value={formData.content}
                    onChangeText={(val) => setFormData({...formData, content: val})}
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
                    onPress={handleSendAnnouncement}
                  >
                    <Text style={styles.createBtnText}>Duyuruyu Gönder</Text>
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
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  announcementInfo: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  announcementMeta: {
    fontSize: 12,
    marginBottom: 10,
  },
  announcementBody: {
    fontSize: 14,
    lineHeight: 20,
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
    maxWidth: 600,
    borderRadius: 24,
    padding: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  rolePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 10,
  },
  cancelBtn: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: 'bold',
  }
});

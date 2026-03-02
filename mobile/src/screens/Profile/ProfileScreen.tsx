import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuthStore } from '../../store/auth.store';
import { ProfileService, UserStats } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { AppShell } from '../../components/layout/AppShell';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Directory, File, Paths } from 'expo-file-system/next';

export const ProfileScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { isDesktop } = useBreakpoint();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await ProfileService.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await AuthService.logout();
  };

  const handleDownloadCertificate = async () => {
    if ((stats?.totalHours || 0) === 0) {
      Alert.alert('Uyarı', 'Henüz onaylanmış gönüllülük saatiniz bulunmadığı için sertifika oluşturulamaz.');
      return;
    }

    setDownloading(true);
    try {
      const response = await ProfileService.getCertificate();
      
      if (Platform.OS === 'web') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `sertifika_${user?.firstName}_${user?.lastName}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(response.data);
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
        });

        const filename = `sertifika_${user?.firstName}_${user?.lastName}.pdf`;
        const dir = new Directory(Paths.document.uri || '');
        const fileUri = dir.uri + filename;
        const file = new File(fileUri);
        
        await file.write(base64);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Hata', 'Paylaşım bu cihazda kullanılamıyor.');
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Hata', 'Sertifika indirilirken bir sorun oluştu.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E05A47" />
      </View>
    );
  }

  return (
    <AppShell activeRoute="Profile" navigation={navigation}>
      <ResponsiveContainer>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Profil</Text>
        </View>

        <View style={isDesktop ? styles.desktopLayout : styles.mobileLayout}>
          {/* User Info Card */}
          <View style={[styles.card, styles.userCard, isDesktop && styles.desktopCard]}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{user?.firstName?.[0]}</Text>
            </View>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user?.role}</Text>
            </View>
            
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Okul:</Text>
                <Text style={styles.infoValue}>{user?.school || '42 Istanbul'}</Text>
              </View>
              {user?.phone && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Telefon:</Text>
                  <Text style={styles.infoValue}>{user?.phone}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View style={isDesktop ? styles.desktopStatsCol : styles.mobileStatsCol}>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>⏱️</Text>
                <Text style={styles.statValue}>{stats?.totalHours || 0}</Text>
                <Text style={styles.statLabel}>Toplam Saat</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>🎖️</Text>
                <Text style={styles.statValue}>{stats?.totalBadges || 0}</Text>
                <Text style={styles.statLabel}>Rozetler</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>📅</Text>
                <Text style={styles.statValue}>{stats?.upcomingEvents || 0}</Text>
                <Text style={styles.statLabel}>Etkinlikler</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>🏆</Text>
                <Text style={styles.statValue}>{stats?.rank ? `#${stats.rank}` : '-'}</Text>
                <Text style={styles.statLabel}>Sıralama</Text>
              </View>
            </View>

            {/* Certificate Card */}
            <View style={styles.certCard}>
              <View style={styles.certInfo}>
                <Text style={styles.certEmoji}>📜</Text>
                <View>
                  <Text style={styles.certTitle}>Gönüllülük Sertifikası</Text>
                  <Text style={styles.certSubtitle}>Başarılarını resmiyete dök</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.certBtn, downloading && styles.certBtnDisabled]} 
                onPress={handleDownloadCertificate}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.certBtnText}>İndir (PDF)</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Impact Quote */}
            <View style={styles.impactCard}>
              <Text style={styles.impactEmoji}>✨</Text>
              <Text style={styles.impactText}>
                "{user?.firstName}, yaptığın her bir saatlik gönüllülük LÖSEV çocukları için umut oluyor. Teşekkürler!"
              </Text>
            </View>
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
  header: {
    marginBottom: 30,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  desktopLayout: {
    flexDirection: 'row',
  },
  mobileLayout: {
    flexDirection: 'column',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  desktopCard: {
    width: 350,
    marginRight: 40,
  },
  userCard: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFEBEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLargeText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#E05A47',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#E05A47',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 15,
  },
  roleBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  infoList: {
    width: '100%',
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 20,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
  },
  infoValue: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 30,
    width: '100%',
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  logoutBtnText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  desktopStatsCol: {
    flex: 1,
  },
  mobileStatsCol: {
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  statBox: {
    backgroundColor: '#FFF',
    flexBasis: '45%',
    flexGrow: 1,
    padding: 20,
    margin: 10,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  certCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  certInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  certEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  certTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  certSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  certBtn: {
    backgroundColor: '#E05A47',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  certBtnDisabled: {
    backgroundColor: '#CCC',
  },
  certBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  impactCard: {
    backgroundColor: '#E05A47',
    padding: 30,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  impactEmoji: {
    fontSize: 32,
    marginBottom: 15,
  },
  impactText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  }
});

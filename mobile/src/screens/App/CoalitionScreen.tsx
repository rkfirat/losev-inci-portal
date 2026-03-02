import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  FlatList
} from 'react-native';
import { CoalitionService, CoalitionData } from '../../services/coalition.service';
import { AppShell } from '../../components/layout/AppShell';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useAuthStore } from '../../store/auth.store';

export const CoalitionScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<CoalitionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [myTeam, setMyTeam] = useState<CoalitionData | null>(null);

  const fetchData = async () => {
    try {
      const res = await CoalitionService.getTeamLeaderboard();
      if (res.success) {
        setTeams(res.data);
        const team = res.data.find(t => t.id === user?.coalition?.id || t.id === user?.coalitionId);
        if (team) setMyTeam(team);
      }
    } catch (error) {
      console.error('Failed to fetch coalition data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderTeamItem = ({ item, index }: { item: CoalitionData, index: number }) => (
    <View style={[styles.teamCard, item.id === myTeam?.id && styles.myTeamCard]}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <Image source={{ uri: item.imageUrl }} style={styles.teamIcon} />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.memberCount}>{item.memberCount} Üye</Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{item.totalHours.toFixed(1)}</Text>
        <Text style={styles.scoreLabel}>saat</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E05A47" />
      </View>
    );
  }

  return (
    <AppShell activeRoute="Coalition" navigation={navigation}>
      <ResponsiveContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Takımlar</Text>
            <Text style={styles.subtitle}>Birlikte daha güçlüyüz</Text>
          </View>

          {myTeam ? (
            <View style={[styles.myTeamBanner, { backgroundColor: myTeam.color + '20' }]}>
              <View style={styles.bannerContent}>
                <Image source={{ uri: myTeam.imageUrl }} style={styles.largeIcon} />
                <View>
                  <Text style={styles.bannerTitle}>Senin Takımın: {myTeam.name}</Text>
                  <Text style={styles.bannerDesc}>{myTeam.description}</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{myTeam.totalHours.toFixed(0)}</Text>
                  <Text style={styles.statLab}>Toplam Saat</Text>
                </View>
                <View style={[styles.statItem, styles.borderLeft]}>
                  <Text style={styles.statVal}>{teams.findIndex(t => t.id === myTeam.id) + 1}</Text>
                  <Text style={styles.statLab}>Sıralama</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noTeamBox}>
              <Text style={styles.noTeamText}>Henüz bir takımın yok. Yakında bir takıma atanacaksın!</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Takım Sıralaması</Text>
            {teams.map((team, index) => (
              <View key={team.id} style={{ marginBottom: 10 }}>
                {renderTeamItem({ item: team, index })}
              </View>
            ))}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
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
    marginBottom: 20,
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
  myTeamBanner: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  largeIcon: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  bannerDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    maxWidth: 200,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.05)',
  },
  statVal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E05A47',
  },
  statLab: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  myTeamCard: {
    borderColor: '#E05A47',
    backgroundColor: '#FFF9F8',
  },
  rankContainer: {
    width: 30,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
  },
  teamIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  memberCount: {
    fontSize: 12,
    color: '#888',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#999',
  },
  noTeamBox: {
    padding: 30,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  noTeamText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});

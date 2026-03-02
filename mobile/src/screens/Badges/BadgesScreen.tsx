import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, SafeAreaView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { BadgeService, Badge } from '../../services/badge.service';

const { width } = Dimensions.get('window');

export const BadgesScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [myBadges, setMyBadges] = useState<Badge[]>([]);

  const fetchData = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        BadgeService.getAllBadges(),
        BadgeService.getMyBadges(),
      ]);
      if (allRes.success) setAllBadges(allRes.data);
      if (myRes.success) setMyBadges(myRes.data);
    } catch (error) {
      console.error('Failed to fetch badges', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const isEarned = (badgeId: string) => {
    return myBadges.some(mb => mb.id === badgeId);
  };

  const renderItem = ({ item }: { item: Badge }) => {
    const earned = isEarned(item.id);
    return (
      <TouchableOpacity 
        style={[styles.badgeCard, !earned && styles.lockedCard]}
        onPress={() => navigation.navigate('BadgeDetail', { badge: item, earned })}
      >
        <View style={[styles.iconContainer, !earned && styles.lockedIcon]}>
          <Text style={styles.badgeIcon}>🎖️</Text>
        </View>
        <Text style={styles.badgeName} numberOfLines={1}>{item.name}</Text>
        <View style={[styles.statusTag, earned ? styles.earnedTag : styles.lockedTag]}>
          <Text style={styles.statusTagText}>{earned ? 'Kazanıldı' : 'Kilitli'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Rozet Vitrini</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading && allBadges.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E05A47" />
        </View>
      ) : (
        <FlatList
          data={allBadges}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#E05A47"]} tintColor="#E05A47" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz rozet tanımlanmamış.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 5,
  },
  backBtnText: {
    color: '#E05A47',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
  },
  badgeCard: {
    backgroundColor: '#FFF',
    width: (width - 60) / 3,
    padding: 10,
    margin: 5,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  lockedCard: {
    backgroundColor: '#F9F9F9',
    opacity: 0.7,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFEBEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  lockedIcon: {
    backgroundColor: '#EEE',
  },
  badgeIcon: {
    fontSize: 28,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  earnedTag: {
    backgroundColor: '#4CD96420',
  },
  lockedTag: {
    backgroundColor: '#8E8E9320',
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4CD964',
  },
  lockedTagText: {
    color: '#8E8E93',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});

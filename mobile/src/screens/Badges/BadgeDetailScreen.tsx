import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Share } from 'react-native';

const { width } = Dimensions.get('window');

export const BadgeDetailScreen = ({ route, navigation }: any) => {
  const { badge, earned } = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `LÖSEV İnci Portalı'nda "${badge.name}" rozetini kazandım! 🎉 @losev1998 #LÖSEV #Gönüllülük`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Kapat</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconCircle, !earned && styles.lockedCircle]}>
          <Text style={styles.badgeIcon}>🎖️</Text>
        </View>

        <Text style={styles.badgeName}>{badge.name}</Text>
        
        <View style={[styles.statusTag, earned ? styles.earnedTag : styles.lockedTag]}>
          <Text style={[styles.statusTagText, earned ? styles.earnedText : styles.lockedText]}>
            {earned ? 'BU ROZET KAZANILDI' : 'BU ROZET HENÜZ KAZANILMADI'}
          </Text>
        </View>

        <Text style={styles.description}>{badge.description}</Text>

        {!earned && badge.criteria && (
          <View style={styles.criteriaBox}>
            <Text style={styles.criteriaTitle}>Nasıl Kazanılır?</Text>
            <Text style={styles.criteriaText}>
              {badge.criteria.type === 'hours' 
                ? `Toplam ${badge.criteria.threshold} saat onaylı gönüllülük çalışması yaparak bu rozeti kazanabilirsiniz.`
                : 'Özel bir etkinlik veya başarı sonrası kazanılır.'}
            </Text>
          </View>
        )}

        {earned && badge.earnedAt && (
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.earnedDate}>Kazanılma Tarihi: {new Date(badge.earnedAt).toLocaleDateString('tr-TR')}</Text>
            
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>Rozeti Paylaş</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 20,
    alignItems: 'flex-end',
  },
  backBtn: {
    padding: 5,
  },
  backBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFEBEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: "#E05A47",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  lockedCircle: {
    backgroundColor: '#EEE',
    shadowOpacity: 0,
    elevation: 0,
  },
  badgeIcon: {
    fontSize: 60,
  },
  badgeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 25,
  },
  earnedTag: {
    backgroundColor: '#4CD96420',
  },
  lockedTag: {
    backgroundColor: '#8E8E9320',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  earnedText: {
    color: '#4CD964',
  },
  lockedText: {
    color: '#8E8E93',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  criteriaBox: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  criteriaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  criteriaText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  earnedDate: {
    fontSize: 13,
    color: '#999',
    marginTop: 20,
    marginBottom: 20,
  },
  shareBtn: {
    backgroundColor: '#E05A47',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: "#E05A47",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  shareBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

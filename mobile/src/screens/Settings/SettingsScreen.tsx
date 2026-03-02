import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
} from 'react-native';
import { AppShell } from '../../components/layout/AppShell';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useTheme, useThemeStore } from '../../store/theme.store';

export const SettingsScreen = ({ navigation }: any) => {
  const { colors, isDark, mode } = useTheme();
  const { setMode } = useThemeStore();

  const toggleDarkMode = (value: boolean) => {
    setMode(value ? 'dark' : 'light');
  };

  return (
    <AppShell activeRoute="Settings" navigation={navigation}>
      <ResponsiveContainer>
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Ayarlar</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Görünüm</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.row, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Karanlık Mod</Text>
                <Text style={[styles.rowSubLabel, { color: colors.textSecondary }]}>Uygulamayı koyu temada kullanın</Text>
              </View>
              <Switch 
                value={isDark} 
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#DDD', true: colors.primary }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Bildirimler</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.row, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Anlık Bildirimler</Text>
                <Text style={[styles.rowSubLabel, { color: colors.textSecondary }]}>Rozet ve etkinlik bildirimleri alın</Text>
              </View>
              <Switch 
                value={true} 
                onValueChange={() => {}}
                trackColor={{ false: '#DDD', true: colors.primary }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Hakkında</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Kullanım Koşulları</Text>
              <Text style={[styles.arrow, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <View style={[styles.row, styles.noBorder]}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Versiyon</Text>
              <Text style={[styles.rowValue, { color: colors.textSecondary }]}>1.0.0 (Production Ready)</Text>
            </View>
          </View>
        </View>
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
  },
  section: {
    marginBottom: 30,
    width: '100%',
    maxWidth: 600,
  },
  sectionTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowSubLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  rowValue: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 20,
  }
});

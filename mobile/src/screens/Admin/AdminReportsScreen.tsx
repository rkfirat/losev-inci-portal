import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { AdminService } from '../../services/admin.service';
import { AppShell } from '../../components/layout/AppShell';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useTheme } from '../../store/theme.store';

export const AdminReportsScreen = ({ navigation }: any) => {
  const { isDesktop } = useBreakpoint();
  const { colors } = useTheme();
  
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      const res = await AdminService.getReport();
      if (res.success) {
        setReportData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch report', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const exportCSV = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Bilgi', 'CSV dışa aktarma web sürümünde desteklenmektedir.');
      return;
    }
    
    const headers = ['Gönüllü', 'E-posta', 'Okul', 'Proje', 'Saat', 'Tarih'];
    const rows = reportData.map(item => [
      item.volunteer,
      item.email,
      item.school,
      item.project,
      item.hours,
      item.date
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `losev_gonullu_rapor_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderHeader = () => (
    <View style={[styles.reportHeader, { backgroundColor: colors.surfaceSecondary, borderBottomColor: colors.border }]}>
      <Text style={[styles.columnHeader, { color: colors.textSecondary, flex: 2 }]}>Gönüllü</Text>
      <Text style={[styles.columnHeader, { color: colors.textSecondary, flex: 2 }]}>Proje</Text>
      <Text style={[styles.columnHeader, { color: colors.textSecondary, flex: 1 }]}>Saat</Text>
      <Text style={[styles.columnHeader, { color: colors.textSecondary, flex: 1.5 }]}>Tarih</Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.reportRow, { borderBottomColor: colors.border }]}>
      <View style={{ flex: 2 }}>
        <Text style={[styles.cellText, { color: colors.text }]} numberOfLines={1}>{item.volunteer}</Text>
        <Text style={[styles.subCellText, { color: colors.textSecondary }]} numberOfLines={1}>{item.school}</Text>
      </View>
      <Text style={[styles.cellText, { color: colors.text, flex: 2 }]} numberOfLines={1}>{item.project}</Text>
      <Text style={[styles.cellText, { color: colors.primary, flex: 1, fontWeight: 'bold' }]}>{item.hours}s</Text>
      <Text style={[styles.cellText, { color: colors.textSecondary, flex: 1.5 }]}>{item.date}</Text>
    </View>
  );

  return (
    <AppShell activeRoute="AdminReports" navigation={navigation}>
      <ResponsiveContainer>
        <View style={styles.header}>
          <View>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Sistem Raporları</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Onaylı tüm gönüllülük faaliyetlerini inceleyin</Text>
          </View>
          <TouchableOpacity 
            style={[styles.exportBtn, { backgroundColor: colors.primary }]}
            onPress={exportCSV}
          >
            <Text style={styles.exportBtnText}>CSV Olarak İndir</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={[styles.tableCard, { backgroundColor: colors.surface }]}>
            {renderHeader()}
            <FlatList
              data={reportData}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Raporlanacak veri bulunmuyor.</Text>
                </View>
              }
            />
          </View>
        )}
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
  exportBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exportBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  center: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 40,
  },
  reportHeader: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  reportRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  cellText: {
    fontSize: 14,
  },
  subCellText: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  }
});

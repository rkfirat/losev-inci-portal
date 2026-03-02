import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  RefreshControl,
  ScrollView,
  Platform
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { EventService, EventData } from '../../services/event.service';
import { AppShell } from '../../components/layout/AppShell';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useTheme } from '../../store/theme.store';

// Configure Locale for Turkish
LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  dayNames: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
  dayNamesShort: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
  today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

export const EventsScreen = ({ navigation }: any) => {
  const { isDesktop } = useBreakpoint();
  const { colors, isDark } = useTheme();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState<any>({});

  const fetchEvents = async () => {
    try {
      const res = await EventService.getAllEvents();
      if (res.success) {
        setEvents(res.data);
        prepareMarkedDates(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const prepareMarkedDates = (data: EventData[]) => {
    const marks: any = {};
    data.forEach(event => {
      const date = new Date(event.startDate).toISOString().split('T')[0];
      marks[date] = { 
        marked: true, 
        dotColor: colors.primary,
        activeOpacity: 0.8
      };
    });
    setMarkedDates(marks);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const renderEventCard = ({ item }: { item: EventData }) => {
    const startDate = new Date(item.startDate);
    
    return (
      <TouchableOpacity 
        style={[styles.card, isDesktop && styles.desktopCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('EventDetail', { id: item.id })}
      >
        <Image 
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/600x300/E05A47/FFFFFF?text=LÖSEV+Etkinlik' }} 
          style={styles.cardImage} 
        />
        <View style={styles.cardContent}>
          <View style={[styles.dateBadge, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Text style={[styles.dateDay, { color: colors.text }]}>{startDate.getDate()}</Text>
            <Text style={[styles.dateMonth, { color: colors.primary }]}>{startDate.toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase()}</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <View style={styles.row}>
              <Text style={[styles.iconText, { color: colors.textSecondary }]}>📍 {item.location}</Text>
              <Text style={[styles.iconText, { color: colors.textSecondary }]}>  •  </Text>
              <Text style={[styles.iconText, { color: colors.textSecondary }]}>⏰ {startDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <View style={styles.communityRow}>
              <View style={styles.avatars}>
                {item.participants?.slice(0, 3).map((p, i) => (
                  <View key={i} style={[styles.avatar, { marginLeft: i === 0 ? 0 : -10, backgroundColor: colors.primary, borderColor: colors.surface }]}>
                    <Text style={styles.avatarText}>{p.user.firstName[0]}</Text>
                  </View>
                ))}
                {item._count.participants > 3 && (
                  <View style={[styles.avatar, styles.moreAvatar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.surface }]}>
                    <Text style={[styles.moreText, { color: colors.textSecondary }]}>+{item._count.participants - 3}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.attendingText, { color: colors.textSecondary }]}>{item._count.participants} kişi katılıyor</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredEvents = selectedDate 
    ? events.filter(e => new Date(e.startDate).toISOString().split('T')[0] === selectedDate)
    : events;

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <AppShell activeRoute="Events" navigation={navigation}>
      <ResponsiveContainer>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View>
              <Text style={[styles.pageTitle, { color: colors.text }]}>Etkinlikler</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Topluluğumuza katılın ve fark yaratın</Text>
            </View>
            <View style={[styles.toggleContainer, { backgroundColor: colors.surfaceSecondary }]}>
              <TouchableOpacity 
                style={[styles.toggleBtn, viewMode === 'list' && [styles.toggleBtnActive, { backgroundColor: colors.surface }]]} 
                onPress={() => { setViewMode('list'); setSelectedDate(''); }}
              >
                <Text style={[styles.toggleBtnText, { color: colors.textSecondary }, viewMode === 'list' && { color: colors.primary }]}>Liste</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, viewMode === 'calendar' && [styles.toggleBtnActive, { backgroundColor: colors.surface }]]} 
                onPress={() => setViewMode('calendar')}
              >
                <Text style={[styles.toggleBtnText, { color: colors.textSecondary }, viewMode === 'calendar' && { color: colors.primary }]}>Takvim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {viewMode === 'calendar' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Calendar
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.textSecondary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: colors.primary,
                dayTextColor: colors.text,
                textDisabledColor: isDark ? '#444' : '#d9e1e8',
                dotColor: colors.primary,
                selectedDotColor: '#ffffff',
                arrowColor: colors.primary,
                disabledArrowColor: isDark ? '#444' : '#d9e1e8',
                monthTextColor: colors.text,
                indicatorColor: colors.primary,
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13
              }}
              onDayPress={day => {
                setSelectedDate(day.dateString);
              }}
              markedDates={{
                ...markedDates,
                [selectedDate]: {
                  ...markedDates[selectedDate],
                  selected: true,
                  disableTouchEvent: true,
                  selectedColor: colors.primary,
                  selectedTextColor: 'white'
                }
              }}
              style={[styles.calendar, { backgroundColor: colors.surface }]}
            />
            
            <View style={styles.calendarEventsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedDate ? `${new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} Etkinlikleri` : 'Tüm Etkinlikler'}
              </Text>
              {selectedDate && (
                <TouchableOpacity onPress={() => setSelectedDate('')}>
                  <Text style={[styles.clearFilter, { color: colors.primary }]}>Filtreyi Temizle</Text>
                </TouchableOpacity>
              )}
            </View>

            {filteredEvents.map(event => (
              <View key={event.id} style={{ marginBottom: 15 }}>
                {renderEventCard({ item: event })}
              </View>
            ))}
            
            {filteredEvents.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Bu tarihte etkinlik bulunmuyor.</Text>
              </View>
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        ) : (
          <FlatList
            data={events}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id}
            numColumns={isDesktop ? 2 : 1}
            key={isDesktop ? 'desktop' : 'mobile'}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz aktif etkinlik bulunmuyor.</Text>
              </View>
            }
          />
        )}
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    marginTop: 10,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  toggleBtnActive: {
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }
    }),
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
      }
    }),
  },
  desktopCard: {
    flex: 1,
    marginHorizontal: 10,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cardContent: {
    padding: 15,
    flexDirection: 'row',
  },
  dateBadge: {
    width: 50,
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconText: {
    fontSize: 13,
  },
  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  avatars: {
    flexDirection: 'row',
    marginRight: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  moreAvatar: {
    marginLeft: -10,
  },
  moreText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  attendingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  calendar: {
    borderRadius: 16,
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: '0px 2px 10px rgba(0,0,0,0.05)' },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      }
    }),
  },
  calendarEventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearFilter: {
    fontSize: 14,
    fontWeight: '600',
  }
});


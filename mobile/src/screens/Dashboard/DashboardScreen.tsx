import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useThemeColors } from '../../hooks/useThemeColors';
import { typography, spacing, borderRadius } from '../../theme';
import { portalService } from '../../services/portal';
import { formatDate } from '../../utils/format';
import { useAuthStore } from '../../store/authStore';
import { LineChart } from 'react-native-chart-kit';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 2 - CARD_GAP) / 2;

const ROLE_LABELS: Record<string, string> = {
    STUDENT: '🎓 Öğrenci',
    TEACHER: '👨‍🏫 Koordinatör',
    ADMIN: '🛡️ Yönetici',
};

const ROLE_COLORS: Record<string, string> = {
    STUDENT: '#6366F1',
    TEACHER: '#059669',
    ADMIN: '#DC2626',
};

export function DashboardScreen() {
    const colors = useThemeColors();
    const user = useAuthStore((s) => s.user);
    const role = user?.role ?? 'STUDENT';
    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['dashboard'],
        queryFn: portalService.getDashboard,
    });

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const stats = data?.stats;
    const firstName = user?.firstName ?? 'Gönüllü';

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
            }
        >
            {/* Welcome Header */}
            <View style={[styles.headerCard, { backgroundColor: ROLE_COLORS[role] ?? colors.primary }]}>
                <View style={styles.headerContent}>
                    <Text style={styles.greeting}>Merhaba, {firstName}! 👋</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{ROLE_LABELS[role] ?? role}</Text>
                    </View>
                    <Text style={styles.headerSub}>LÖSEV İnci Gönüllülük Portalı</Text>
                </View>
                <View style={styles.headerStats}>
                    {role === 'STUDENT' ? (
                        <>
                            <HeaderStat value={`${stats?.totalHours ?? 0}`} label="Toplam Saat" />
                            <View style={styles.headerStatDivider} />
                            <HeaderStat value={`${stats?.monthlyHours ?? 0}`} label="Bu Ay" />
                            <View style={styles.headerStatDivider} />
                            <HeaderStat value={`#${stats?.leaderboardRank ?? '-'}`} label="Sıralama" />
                        </>
                    ) : role === 'TEACHER' ? (
                        <>
                            <HeaderStat value={`${stats?.pendingCount ?? 0}`} label="Onay Bekleyen" />
                            <View style={styles.headerStatDivider} />
                            <HeaderStat value={`${stats?.totalHours ?? 0}`} label="Okul Saati" />
                            <View style={styles.headerStatDivider} />
                            <HeaderStat value={`${stats?.monthlyHours ?? 0}`} label="Bu Ay" />
                        </>
                    ) : (
                        <>
                            <HeaderStat value={`${stats?.totalHours ?? 0}`} label="Toplam Saat" />
                            <View style={styles.headerStatDivider} />
                            <HeaderStat value={`${stats?.pendingCount ?? 0}`} label="Bekleyen" />
                            <View style={styles.headerStatDivider} />
                            <HeaderStat value={`${stats?.earnedBadges ?? 0}`} label="Kullanıcı" />
                        </>
                    )}
                </View>
            </View>

            {/* Role-specific content */}
            {role === 'STUDENT' && <StudentDashboard stats={stats} data={data} colors={colors} />}
            {role === 'TEACHER' && <TeacherDashboard stats={stats} data={data} colors={colors} />}
            {role === 'ADMIN' && <AdminDashboard stats={stats} data={data} colors={colors} />}

            {/* Upcoming Events — all roles */}
            {data?.upcomingEvents && data.upcomingEvents.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 Yaklaşan Etkinlikler</Text>
                    {data.upcomingEvents.map((e: any) => (
                        <View key={e.id} style={[styles.eventCard, { backgroundColor: colors.surface }]}>
                            <View style={styles.eventHeader}>
                                <View style={[styles.eventDot, { backgroundColor: colors.primary }]} />
                                <Text style={[typography.subtitle1, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                                    {e.title}
                                </Text>
                            </View>
                            <View style={styles.eventMeta}>
                                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                                <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                                    {formatDate(e.date)}
                                </Text>
                                {e.location && (
                                    <>
                                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} style={{ marginLeft: spacing.sm }} />
                                        <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4, flex: 1 }]} numberOfLines={1}>
                                            {e.location}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.spacer} />
        </ScrollView>
    );
}

/* =================== STUDENT DASHBOARD =================== */
function StudentDashboard({ stats, data, colors }: any) {
    return (
        <>
            <View style={styles.statsGrid}>
                <StatCard icon="time-outline" label="Toplam Saat" value={`${stats?.totalHours ?? 0}`} color="#6366F1" bgColor="#EEF2FF" />
                <StatCard icon="calendar-outline" label="Bu Ay" value={`${stats?.monthlyHours ?? 0}`} color="#10B981" bgColor="#ECFDF5" />
                <StatCard icon="hourglass-outline" label="Bekleyen" value={`${stats?.pendingCount ?? 0}`} color="#F59E0B" bgColor="#FFFBEB" />
                <StatCard icon="ribbon-outline" label="Rozetler" value={`${stats?.earnedBadges ?? 0}/${stats?.totalBadges ?? 0}`} color="#8B5CF6" bgColor="#F5F3FF" />
            </View>

            {/* Monthly Hours Chart */}
            <View style={[styles.chartSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>📊 Aylık Gönüllülük Saatleri</Text>
                <LineChart
                    data={{
                        labels: ['Eki', 'Kas', 'Ara', 'Oca', 'Şub', 'Mar'],
                        datasets: [{
                            data: [
                                Math.max(0, (stats?.totalHours ?? 0) * 0.1),
                                Math.max(0, (stats?.totalHours ?? 0) * 0.15),
                                Math.max(0, (stats?.totalHours ?? 0) * 0.2),
                                Math.max(0, (stats?.totalHours ?? 0) * 0.25),
                                Math.max(0, (stats?.totalHours ?? 0) * 0.15),
                                Math.max(0, stats?.monthlyHours ?? 0),
                            ],
                        }],
                    }}
                    width={SCREEN_WIDTH - spacing.md * 4}
                    height={180}
                    yAxisSuffix="h"
                    chartConfig={{
                        backgroundColor: 'transparent',
                        backgroundGradientFrom: colors.surface,
                        backgroundGradientTo: colors.surface,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                        labelColor: () => colors.textSecondary,
                        propsForDots: { r: '5', strokeWidth: '2', stroke: '#6366F1' },
                        propsForBackgroundLines: { stroke: colors.border },
                    }}
                    bezier
                    style={{ borderRadius: 12 }}
                />
            </View>

            {/* Progress toward next badge */}
            <View style={[styles.progressSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>🎯 Hedefim</Text>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${Math.min(((stats?.totalHours ?? 0) / 25) * 100, 100)}%`, backgroundColor: '#6366F1' }]} />
                </View>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                    {stats?.totalHours ?? 0} / 25 saat — Bronz İnci Rozeti
                </Text>
            </View>

            {data?.recentBadges && data.recentBadges.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>🏅 Son Rozetler</Text>
                    <View style={styles.badgeRow}>
                        {data.recentBadges.map((b: any) => (
                            <View key={b.id} style={[styles.badgeChip, { backgroundColor: colors.primaryContainer }]}>
                                <Ionicons name="ribbon" size={16} color={colors.primary} />
                                <Text style={[typography.caption, { color: colors.primary, marginLeft: 4, fontWeight: '600' }]}>{b.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </>
    );
}

/* =================== TEACHER DASHBOARD =================== */
function TeacherDashboard({ stats, colors }: any) {
    return (
        <>
            <View style={styles.statsGrid}>
                <StatCard icon="hourglass-outline" label="Onay Bekleyen" value={`${stats?.pendingCount ?? 0}`} color="#F59E0B" bgColor="#FFFBEB" />
                <StatCard icon="checkmark-circle-outline" label="Onaylanan" value={`${stats?.totalHours ?? 0}`} color="#10B981" bgColor="#ECFDF5" />
                <StatCard icon="people-outline" label="Öğrenci Sayısı" value={`${stats?.earnedBadges ?? 0}`} color="#6366F1" bgColor="#EEF2FF" />
                <StatCard icon="school-outline" label="Okul Sıralaması" value={`#${stats?.leaderboardRank ?? '-'}`} color="#8B5CF6" bgColor="#F5F3FF" />
            </View>

            {/* Teacher Quick Actions */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ Hızlı İşlemler</Text>
                <View style={[styles.quickAction, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="hourglass-outline" size={20} color="#D97706" />
                    <Text style={[typography.body1, { color: '#92400E', marginLeft: 8, flex: 1 }]}>
                        {stats?.pendingCount ?? 0} öğrenci saati onayınızı bekliyor
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#D97706" />
                </View>
                <View style={[styles.quickAction, { backgroundColor: '#DBEAFE' }]}>
                    <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
                    <Text style={[typography.body1, { color: '#1E40AF', marginLeft: 8, flex: 1 }]}>
                        Yeni etkinlik oluştur
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#2563EB" />
                </View>
            </View>
        </>
    );
}

/* =================== ADMIN DASHBOARD =================== */
function AdminDashboard({ stats, colors }: any) {
    return (
        <>
            <View style={styles.statsGrid}>
                <StatCard icon="people-outline" label="Toplam Kullanıcı" value={`${stats?.earnedBadges ?? 0}`} color="#6366F1" bgColor="#EEF2FF" />
                <StatCard icon="time-outline" label="Toplam Saat" value={`${stats?.totalHours ?? 0}`} color="#10B981" bgColor="#ECFDF5" />
                <StatCard icon="hourglass-outline" label="Onay Bekleyen" value={`${stats?.pendingCount ?? 0}`} color="#F59E0B" bgColor="#FFFBEB" />
                <StatCard icon="school-outline" label="Aktif Okul" value={`${stats?.leaderboardRank ?? 0}`} color="#8B5CF6" bgColor="#F5F3FF" />
            </View>

            {/* Admin Overview */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Sistem Durumu</Text>
                <View style={[styles.adminCard, { backgroundColor: colors.surface }]}>
                    <AdminRow icon="shield-checkmark-outline" label="Aktif Koordinatörler" value="-" colors={colors} />
                    <AdminRow icon="ribbon-outline" label="Verilen Rozetler" value={`${stats?.totalBadges ?? 0}`} colors={colors} />
                    <AdminRow icon="today-outline" label="Bu Ay Gönüllülük" value={`${stats?.monthlyHours ?? 0} saat`} colors={colors} />
                </View>
            </View>
        </>
    );
}

/* =================== SHARED COMPONENTS =================== */
function HeaderStat({ value, label }: { value: string; label: string }) {
    return (
        <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{value}</Text>
            <Text style={styles.headerStatLabel}>{label}</Text>
        </View>
    );
}

function StatCard({ icon, label, value, color, bgColor }: {
    icon: string; label: string; value: string; color: string; bgColor: string;
}) {
    return (
        <View style={[styles.statCard, { backgroundColor: bgColor }]}>
            <View style={[styles.statIconWrap, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={22} color={color} />
            </View>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function AdminRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
    return (
        <View style={styles.adminRow}>
            <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.textSecondary} />
            <Text style={[typography.body2, { color: colors.text, flex: 1, marginLeft: 10 }]}>{label}</Text>
            <Text style={[typography.subtitle2, { color: colors.primary }]}>{value}</Text>
        </View>
    );
}

/* =================== STYLES =================== */
const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { paddingBottom: spacing.xl },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerCard: {
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        borderRadius: 20,
        padding: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    headerContent: { marginBottom: spacing.md },
    greeting: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        marginTop: 6,
    },
    roleText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
    headerStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.sm + 2,
    },
    headerStatItem: { alignItems: 'center' },
    headerStatValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
    headerStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
    headerStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)' },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        marginTop: spacing.md,
    },
    statCard: {
        width: CARD_WIDTH,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: CARD_GAP,
        alignItems: 'center',
    },
    statIconWrap: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center', marginBottom: 6,
    },
    statValue: { fontSize: 22, fontWeight: '800' },
    statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },

    progressSection: {
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    chartSection: {
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center' as const,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },

    section: { paddingHorizontal: spacing.md, marginTop: spacing.lg },
    sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: spacing.sm },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap' },
    badgeChip: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
        borderRadius: borderRadius.md, marginRight: spacing.xs, marginBottom: spacing.xs,
    },

    eventCard: {
        padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.sm,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    eventHeader: { flexDirection: 'row', alignItems: 'center' },
    eventDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    eventMeta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, marginLeft: 16 },

    quickAction: {
        flexDirection: 'row', alignItems: 'center',
        padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.sm,
    },

    adminCard: {
        borderRadius: borderRadius.lg, padding: spacing.md,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    adminRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },

    spacer: { height: spacing.xl },
});

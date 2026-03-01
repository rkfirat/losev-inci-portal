import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useThemeColors } from '../../hooks/useThemeColors';
import { typography, spacing, borderRadius } from '../../theme';
import { portalService } from '../../services/portal';
import { formatDate } from '../../utils/format';
import { useAuthStore } from '../../store/authStore';
import type { VolunteerHour } from '../../types/portal';
import type { HoursStackScreenProps } from '../../navigation/types';

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Bekliyor',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
};

const STATUS_COLORS: Record<string, string> = {
    PENDING: '#F59E0B',
    APPROVED: '#10B981',
    REJECTED: '#EF4444',
};

type Props = HoursStackScreenProps<'HoursMain'>;

export function HoursScreen({ navigation }: Props) {
    const colors = useThemeColors();
    const role = useAuthStore((s) => s.user?.role ?? 'STUDENT');
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<string | undefined>(undefined);
    const [reviewingId, setReviewingId] = useState<string | null>(null);

    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['hours', 1, filter],
        queryFn: () => portalService.listHours(1, filter),
    });

    const handleReview = async (hourId: string, status: 'APPROVED' | 'REJECTED') => {
        const label = status === 'APPROVED' ? 'onaylamak' : 'reddetmek';
        Alert.alert(
            'Emin misiniz?',
            `Bu gönüllülük saatini ${label} istediğinize emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: status === 'APPROVED' ? 'Onayla ✓' : 'Reddet ✕',
                    style: status === 'REJECTED' ? 'destructive' : 'default',
                    onPress: async () => {
                        setReviewingId(hourId);
                        try {
                            await portalService.reviewHour(hourId, status);
                            await queryClient.invalidateQueries({ queryKey: ['hours'] });
                            await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                            Alert.alert('Başarılı', status === 'APPROVED' ? 'Saat onaylandı!' : 'Saat reddedildi.');
                        } catch {
                            Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
                        } finally {
                            setReviewingId(null);
                        }
                    },
                },
            ],
        );
    };

    const renderItem = ({ item }: { item: VolunteerHour }) => (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
                <Text style={[typography.subtitle1, { color: colors.text, flex: 1 }]}>{item.projectName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                    <Text style={[typography.caption, { color: STATUS_COLORS[item.status], fontWeight: '600' }]}>
                        {STATUS_LABELS[item.status]}
                    </Text>
                </View>
            </View>

            {/* User info for Teacher/Admin */}
            {role !== 'STUDENT' && (item as any).user && (
                <View style={[styles.userRow, { backgroundColor: colors.background }]}>
                    <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
                    <Text style={[typography.caption, { color: colors.text, marginLeft: 4, fontWeight: '600' }]}>
                        {(item as any).user.firstName} {(item as any).user.lastName}
                    </Text>
                    {(item as any).user.school && (
                        <>
                            <Text style={[typography.caption, { color: colors.textSecondary }]}> — </Text>
                            <Text style={[typography.caption, { color: colors.textSecondary }]}>
                                {(item as any).user.school}
                            </Text>
                        </>
                    )}
                </View>
            )}

            <View style={styles.cardMeta}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                    {formatDate(item.date)}
                </Text>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} style={{ marginLeft: spacing.sm }} />
                <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                    {item.hours} saat
                </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
                <View style={{ backgroundColor: colors.primary + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={[typography.caption, { color: colors.primary, fontSize: 10, fontWeight: 'bold' }]}>
                        {item.activityType ? String(item.activityType) : 'DİĞER'}
                    </Text>
                </View>
            </View>

            {item.description && (
                <Text style={[typography.body2, { color: colors.textSecondary, marginTop: spacing.xs }]} numberOfLines={2}>
                    {item.description}
                </Text>
            )}

            {/* Approve/Reject buttons for Teacher/Admin when PENDING */}
            {role !== 'STUDENT' && item.status === 'PENDING' && (
                <View style={styles.reviewRow}>
                    <TouchableOpacity
                        style={[styles.reviewBtn, { backgroundColor: '#ECFDF5' }]}
                        onPress={() => handleReview(item.id, 'APPROVED')}
                        disabled={reviewingId === item.id}
                    >
                        {reviewingId === item.id ? (
                            <ActivityIndicator size="small" color="#10B981" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                <Text style={[typography.caption, { color: '#059669', fontWeight: '700', marginLeft: 4 }]}>Onayla</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.reviewBtn, { backgroundColor: '#FEF2F2' }]}
                        onPress={() => handleReview(item.id, 'REJECTED')}
                        disabled={reviewingId === item.id}
                    >
                        <Ionicons name="close-circle" size={18} color="#EF4444" />
                        <Text style={[typography.caption, { color: '#DC2626', fontWeight: '700', marginLeft: 4 }]}>Reddet</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const filters = [
        { key: undefined, label: 'Tümü' },
        { key: 'PENDING', label: 'Bekleyen' },
        { key: 'APPROVED', label: 'Onaylı' },
        { key: 'REJECTED', label: 'Ret' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Summary */}
            {data && (
                <View style={[styles.summaryBar, { backgroundColor: colors.surface }]}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <Text style={[typography.body2, { color: colors.text, marginLeft: spacing.xs }]}>
                        {role === 'STUDENT' ? 'Onaylı toplam: ' : 'Toplam onaylı: '}
                        <Text style={{ fontWeight: '700' }}>{data.totalApprovedHours} saat</Text>
                    </Text>
                </View>
            )}

            {/* Filters */}
            <View style={styles.filterRow}>
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f.key ?? 'all'}
                        style={[styles.filterChip, filter === f.key && { backgroundColor: colors.primary }]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[typography.caption, { color: filter === f.key ? '#fff' : colors.textSecondary, fontWeight: '600' }]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
            ) : (
                <FlatList
                    data={data?.hours ?? []}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="time-outline" size={48} color={colors.textTertiary} />
                            <Text style={[typography.body1, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                                {role === 'STUDENT' ? 'Henüz gönüllülük saati yok' : 'Bekleyen saat bulunmuyor'}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* FAB: only for students */}
            {role === 'STUDENT' && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('AddHour')}
                >
                    <Ionicons name="add" size={24} color="#FFF" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    summaryBar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        marginHorizontal: spacing.md, marginTop: spacing.sm, borderRadius: borderRadius.lg,
    },
    filterRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    filterChip: {
        paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
        borderRadius: borderRadius.md, marginRight: spacing.xs, backgroundColor: 'transparent',
    },
    list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
    card: { padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.sm },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
    userRow: {
        flexDirection: 'row', alignItems: 'center',
        marginTop: spacing.xs, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
    },
    reviewRow: {
        flexDirection: 'row', marginTop: spacing.sm, gap: spacing.sm,
    },
    reviewBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
    },
    empty: { alignItems: 'center', marginTop: spacing.xl * 2 },
    fab: {
        position: 'absolute', bottom: spacing.xl, right: spacing.lg,
        width: 56, height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center',
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25, shadowRadius: 3.84,
    },
});

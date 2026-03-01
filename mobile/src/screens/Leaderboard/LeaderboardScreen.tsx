import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useThemeColors } from '../../hooks/useThemeColors';
import { typography, spacing, borderRadius } from '../../theme';
import { portalService } from '../../services/portal';
import { useAuthStore } from '../../store/authStore';
import type { LeaderboardEntry } from '../../types/portal';

const PERIOD_OPTIONS = [
    { key: 'weekly', label: 'Haftalık' },
    { key: 'monthly', label: 'Aylık' },
    { key: 'yearly', label: 'Yıllık' },
    { key: 'all', label: 'Tüm Zamanlar' },
];

export function LeaderboardScreen() {
    const colors = useThemeColors();
    const [period, setPeriod] = useState('monthly');
    const currentUserId = useAuthStore((s) => s.user?.id);

    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['leaderboard', period],
        queryFn: () => portalService.getLeaderboard(period),
    });

    const getMedalIcon = (rank: number): string => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `${rank}`;
    };

    const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
        const rank = index + 1;
        const isMe = item.userId === currentUserId;

        return (
            <View style={[
                styles.row,
                { backgroundColor: isMe ? colors.primary + '10' : colors.surface },
                isMe && { borderWidth: 1.5, borderColor: colors.primary },
                rank <= 3 && styles.topRow,
            ]}>
                <View style={[styles.rankCircle, rank <= 3 && { backgroundColor: rank === 1 ? '#FCD34D' : rank === 2 ? '#CBD5E1' : '#F59E0B' }]}>
                    <Text style={[styles.rankText, rank <= 3 && { fontSize: 16 }]}>
                        {getMedalIcon(rank)}
                    </Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={[typography.subtitle1, { color: colors.text }]} numberOfLines={1}>
                        {item.firstName} {item.lastName}
                        {isMe && <Text style={{ color: colors.primary, fontWeight: '700' }}> (Ben)</Text>}
                    </Text>
                    {item.school && (
                        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
                            {item.school}
                        </Text>
                    )}
                </View>
                <View style={styles.hoursCol}>
                    <Text style={[styles.hoursValue, { color: colors.primary }]}>{item.totalHours ?? 0}</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>saat</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Period Filters */}
            <View style={styles.filterRow}>
                {PERIOD_OPTIONS.map((opt) => (
                    <TouchableOpacity
                        key={opt.key}
                        style={[styles.filterChip, period === opt.key && { backgroundColor: colors.primary }]}
                        onPress={() => setPeriod(opt.key)}
                    >
                        <Text style={[typography.caption, { color: period === opt.key ? '#fff' : colors.textSecondary, fontWeight: '600' }]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Current user rank banner */}
            {data?.currentUserRank && (
                <View style={[styles.myRank, { backgroundColor: colors.primary }]}>
                    <Ionicons name="trophy" size={20} color="#FCD34D" />
                    <Text style={[typography.body1, { color: '#fff', marginLeft: 8 }]}>
                        Sıralamanız: <Text style={{ fontWeight: '800' }}>#{data.currentUserRank.rank ?? '-'}</Text>
                        {'  •  '}
                        {data.currentUserRank.totalHours ?? 0} saat
                    </Text>
                </View>
            )}

            {isLoading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
            ) : (
                <FlatList
                    data={data?.entries ?? []}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.userId}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="trophy-outline" size={48} color={colors.textTertiary} />
                            <Text style={[typography.body1, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                                Henüz sıralama verisi yok
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    filterRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    filterChip: {
        paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
        borderRadius: borderRadius.md, marginRight: spacing.xs, backgroundColor: 'transparent',
    },
    myRank: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: spacing.md, marginBottom: spacing.sm,
        padding: spacing.md, borderRadius: borderRadius.lg,
    },
    list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
    row: {
        flexDirection: 'row', alignItems: 'center',
        padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.xs,
    },
    topRow: {
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    rankCircle: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center', alignItems: 'center',
    },
    rankText: { fontSize: 14, fontWeight: '800', color: '#374151' },
    userInfo: { flex: 1, marginLeft: spacing.sm },
    hoursCol: { alignItems: 'flex-end' },
    hoursValue: { fontSize: 18, fontWeight: '800' },
    empty: { alignItems: 'center', marginTop: spacing.xl * 2 },
});

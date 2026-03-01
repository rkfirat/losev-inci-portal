import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useThemeColors } from '../../hooks/useThemeColors';
import { typography, spacing, borderRadius } from '../../theme';
import { portalService } from '../../services/portal';
import type { Badge } from '../../types/portal';

export function BadgesScreen() {
    const colors = useThemeColors();
    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['badges'],
        queryFn: portalService.listBadges,
    });

    const renderItem = ({ item }: { item: Badge }) => (
        <View style={[styles.card, { backgroundColor: colors.surface, opacity: item.earned ? 1 : 0.5 }]}>
            <View style={[styles.iconWrap, { backgroundColor: item.earned ? colors.primaryContainer : colors.border + '40' }]}>
                <Ionicons
                    name={item.earned ? 'ribbon' : 'ribbon-outline'}
                    size={32}
                    color={item.earned ? colors.primary : colors.textTertiary}
                />
            </View>
            <Text style={[typography.subtitle1, { color: colors.text, marginTop: spacing.sm, textAlign: 'center' }]}>
                {item.name}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 2 }]} numberOfLines={2}>
                {item.description}
            </Text>
            {item.earned && (
                <View style={[styles.earnedBadge, { backgroundColor: '#10B981' + '20' }]}>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    <Text style={[typography.caption, { color: '#10B981', marginLeft: 2, fontWeight: '600' }]}>Kazanıldı</Text>
                </View>
            )}
            {!item.earned && item.progressPercent !== undefined && (
                <View style={styles.progressWrap}>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${item.progressPercent}%` }]} />
                    </View>
                    <Text style={[typography.caption, { color: colors.textTertiary, marginTop: 2 }]}>%{item.progressPercent}</Text>
                </View>
            )}
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <FlatList
            data={data ?? []}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
            ListEmptyComponent={
                <View style={styles.empty}>
                    <Ionicons name="ribbon-outline" size={48} color={colors.textTertiary} />
                    <Text style={[typography.body1, { color: colors.textSecondary, marginTop: spacing.sm }]}>Henüz rozet yok</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm, paddingBottom: spacing.xl, flexGrow: 1 },
    row: { justifyContent: 'space-between', marginBottom: spacing.sm },
    card: {
        width: '48%',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        minHeight: 160,
    },
    iconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    earnedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        marginTop: spacing.xs,
    },
    progressWrap: { width: '100%', marginTop: spacing.xs, alignItems: 'center' },
    progressBar: { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
    empty: { alignItems: 'center', marginTop: spacing.xl * 2 },
});

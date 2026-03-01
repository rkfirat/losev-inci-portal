import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { typography, spacing, borderRadius } from '../../theme';
import { portalService } from '../../services/portal';
import { formatDate } from '../../utils/format';
import type { EventItem } from '../../types/portal';

export function EventsScreen() {
    const colors = useThemeColors();
    const queryClient = useQueryClient();
    const navigation = useNavigation<any>();

    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['events'],
        queryFn: () => portalService.listEvents(1, 'upcoming'),
    });

    const joinMutation = useMutation({
        mutationFn: (id: string) => portalService.participateEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            Alert.alert('Başarılı', 'Etkinliğe katılım kaydınız oluşturuldu!');
        },
        onError: () => Alert.alert('Hata', 'Katılım kaydı oluşturulamadı.'),
    });

    const handleJoin = useCallback((event: EventItem) => {
        Alert.alert(
            'Etkinliğe Katıl',
            `"${event.title}" etkinliğine katılmak istiyor musunuz?`,
            [
                { text: 'İptal', style: 'cancel' },
                { text: 'Katıl', onPress: () => joinMutation.mutate(event.id) },
            ],
        );
    }, [joinMutation]);

    const renderItem = ({ item }: { item: EventItem }) => (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[typography.subtitle1, { color: colors.text }]}>{item.title}</Text>
            {item.description && (
                <Text style={[typography.body2, { color: colors.textSecondary, marginTop: spacing.xs }]} numberOfLines={3}>
                    {item.description}
                </Text>
            )}
            <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                    {formatDate(item.date)}
                </Text>
            </View>
            {item.location && (
                <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>{item.location}</Text>
                </View>
            )}
            <View style={styles.cardFooter}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {item.participantCount}{item.capacity ? `/${item.capacity}` : ''} katılımcı
                </Text>
                {!item.isFull && !item.isParticipating && (
                    <TouchableOpacity
                        style={[styles.joinBtn, { backgroundColor: colors.primary }]}
                        onPress={() => handleJoin(item)}
                        disabled={joinMutation.isPending}
                    >
                        <Text style={[typography.caption, { color: '#fff', fontWeight: '700' }]}>Katıl</Text>
                    </TouchableOpacity>
                )}
                {item.isParticipating && (
                    <View style={[styles.joinedBadge, { backgroundColor: '#10B981' + '20' }]}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={[typography.caption, { color: '#10B981', marginLeft: 4 }]}>Katılıyorsun</Text>
                    </View>
                )}
                {item.isFull && !item.isParticipating && (
                    <Text style={[typography.caption, { color: colors.error, fontWeight: '600' }]}>Dolu</Text>
                )}
            </View>
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
        <>
            <FlatList
                data={data?.events ?? []}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={{ backgroundColor: colors.background }}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
                        <Text style={[typography.body1, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                            Yaklaşan etkinlik yok
                        </Text>
                    </View>
                }
            />

            {/* QR Scanner FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('QRScanner')}
            >
                <Ionicons name="qr-code-outline" size={24} color="#fff" />
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: spacing.md, paddingBottom: spacing.xl },
    card: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
    joinBtn: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    joinedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    empty: { alignItems: 'center', marginTop: spacing.xl * 2 },
    fab: {
        position: 'absolute',
        bottom: spacing.lg,
        right: spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { typography, spacing, borderRadius } from '../../theme';
import { api } from '../../services/api';

interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    isActive: boolean;
    school?: string;
    createdAt: string;
    totalHours?: number;
}

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

export function AdminUsersScreen() {
    const colors = useThemeColors();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await api.get('/auth/users');
            setUsers(data?.data?.users ?? data?.data ?? []);
        } catch {
            // Fallback: show empty list
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleToggleActive = async (user: AdminUser) => {
        const action = user.isActive ? 'pasif' : 'aktif';
        Alert.alert(
            'Kullanıcı Durumu',
            `${user.firstName} ${user.lastName} kullanıcısını ${action} yapmak istiyor musunuz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: action === 'pasif' ? 'Pasif Yap' : 'Aktif Yap',
                    style: action === 'pasif' ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            await api.patch(`/auth/users/${user.id}`, { isActive: !user.isActive });
                            fetchUsers();
                            Alert.alert('Başarılı', `Kullanıcı ${action} yapıldı.`);
                        } catch {
                            Alert.alert('Hata', 'İşlem başarısız.');
                        }
                    },
                },
            ],
        );
    };

    const handleChangeRole = async (user: AdminUser) => {
        const roles: Array<'STUDENT' | 'TEACHER' | 'ADMIN'> = ['STUDENT', 'TEACHER', 'ADMIN'];
        const options = roles
            .filter((r) => r !== user.role)
            .map((r) => ({
                text: ROLE_LABELS[r],
                onPress: async () => {
                    try {
                        await api.patch(`/auth/users/${user.id}`, { role: r });
                        fetchUsers();
                        Alert.alert('Başarılı', `Rol ${ROLE_LABELS[r]} olarak değiştirildi.`);
                    } catch {
                        Alert.alert('Hata', 'Rol değiştirme başarısız.');
                    }
                },
            }));
        Alert.alert('Rol Değiştir', `${user.firstName} ${user.lastName}`, [
            { text: 'İptal', style: 'cancel' },
            ...options,
        ]);
    };

    const renderItem = ({ item }: { item: AdminUser }) => (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: ROLE_COLORS[item.role] + '20' }]}>
                    <Text style={[styles.avatarText, { color: ROLE_COLORS[item.role] }]}>
                        {item.firstName[0]}{item.lastName[0]}
                    </Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={[typography.subtitle1, { color: colors.text }]}>
                        {item.firstName} {item.lastName}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>{item.email}</Text>
                    {item.school && (
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>🏫 {item.school}</Text>
                    )}
                </View>
                <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[item.role] + '20' }]}>
                    <Text style={[styles.roleText, { color: ROLE_COLORS[item.role] }]}>{ROLE_LABELS[item.role]}</Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: item.isActive ? '#FEF2F2' : '#ECFDF5' }]}
                    onPress={() => handleToggleActive(item)}
                >
                    <Ionicons name={item.isActive ? 'close-circle-outline' : 'checkmark-circle-outline'} size={16} color={item.isActive ? '#EF4444' : '#10B981'} />
                    <Text style={[typography.caption, { color: item.isActive ? '#DC2626' : '#059669', marginLeft: 4, fontWeight: '600' }]}>
                        {item.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#EEF2FF' }]}
                    onPress={() => handleChangeRole(item)}
                >
                    <Ionicons name="swap-horizontal-outline" size={16} color="#6366F1" />
                    <Text style={[typography.caption, { color: '#4F46E5', marginLeft: 4, fontWeight: '600' }]}>Rol Değiştir</Text>
                </TouchableOpacity>
            </View>

            {!item.isActive && (
                <View style={[styles.inactiveBanner, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
                    <Text style={[typography.caption, { color: '#DC2626', marginLeft: 4 }]}>Pasif Hesap</Text>
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.statsBar, { backgroundColor: colors.surface }]}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>{users.length}</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Toplam</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#6366F1' }]}>{users.filter((u) => u.role === 'STUDENT').length}</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Öğrenci</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#059669' }]}>{users.filter((u) => u.role === 'TEACHER').length}</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Koordinatör</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#DC2626' }]}>{users.filter((u) => u.role === 'ADMIN').length}</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Admin</Text>
                </View>
            </View>

            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => { setIsRefreshing(true); fetchUsers(); }}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
                        <Text style={[typography.body1, { color: colors.textSecondary, marginTop: spacing.sm }]}>Kullanıcı bulunamadı</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    statsBar: {
        flexDirection: 'row', justifyContent: 'space-around',
        paddingVertical: spacing.md, marginHorizontal: spacing.md,
        marginTop: spacing.sm, borderRadius: borderRadius.lg,
    },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '800' },
    list: { padding: spacing.md, paddingBottom: spacing.xl },
    card: {
        padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.sm,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 16, fontWeight: '700' },
    userInfo: { flex: 1, marginLeft: spacing.sm },
    roleBadge: {
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    },
    roleText: { fontSize: 10, fontWeight: '700' },
    cardActions: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.sm },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.md,
    },
    inactiveBanner: {
        flexDirection: 'row', alignItems: 'center',
        marginTop: spacing.xs, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
    },
    empty: { alignItems: 'center', marginTop: spacing.xl * 2 },
});

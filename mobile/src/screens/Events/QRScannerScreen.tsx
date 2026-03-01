import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { typography, spacing, borderRadius } from '../../theme';
import { portalService } from '../../services/portal';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const SCAN_SIZE = width * 0.7;

export function QRScannerScreen() {
    const colors = useThemeColors();
    const navigation = useNavigation();
    const queryClient = useQueryClient();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned || processing) return;
        setScanned(true);
        setProcessing(true);

        try {
            // Expected QR format: losev-event:{eventId}
            const match = data.match(/^losev-event:(.+)$/);
            if (!match) {
                Alert.alert('Geçersiz QR', 'Bu QR kod bir LÖSEV etkinliğine ait değil.', [
                    { text: 'Tekrar Dene', onPress: () => { setScanned(false); setProcessing(false); } },
                ]);
                return;
            }

            const eventId = match[1];
            await portalService.participateEvent(eventId);
            await queryClient.invalidateQueries({ queryKey: ['events'] });
            await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

            Alert.alert(
                '✅ Katılım Kaydı',
                'Etkinliğe katılımınız başarıyla kaydedildi!',
                [{ text: 'Tamam', onPress: () => navigation.goBack() }],
            );
        } catch {
            Alert.alert('Hata', 'Katılım kaydı oluşturulamadı. Lütfen tekrar deneyin.', [
                { text: 'Tekrar Dene', onPress: () => { setScanned(false); setProcessing(false); } },
                { text: 'İptal', onPress: () => navigation.goBack() },
            ]);
        }
    };

    if (!permission?.granted) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Ionicons name="camera-outline" size={64} color={colors.textTertiary} />
                <Text style={[typography.body1, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' }]}>
                    QR tarayıcıyı kullanmak için{'\n'}kamera izni vermeniz gerekiyor.
                </Text>
                <TouchableOpacity
                    style={[styles.permBtn, { backgroundColor: colors.primary }]}
                    onPress={requestPermission}
                >
                    <Text style={[typography.body1, { color: '#fff', fontWeight: '600' }]}>İzin Ver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                <View style={styles.overlayTop} />
                <View style={styles.overlayMiddle}>
                    <View style={styles.overlaySide} />
                    <View style={styles.scanArea}>
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />
                    </View>
                    <View style={styles.overlaySide} />
                </View>
                <View style={styles.overlayBottom}>
                    <Text style={styles.scanText}>
                        {processing ? '⏳ İşleniyor...' : '📸 Etkinlik QR kodunu tarayın'}
                    </Text>
                    {scanned && !processing && (
                        <TouchableOpacity
                            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                            onPress={() => setScanned(false)}
                        >
                            <Ionicons name="refresh" size={20} color="#fff" />
                            <Text style={[typography.body2, { color: '#fff', marginLeft: 6, fontWeight: '600' }]}>Tekrar Tara</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
    permBtn: {
        marginTop: spacing.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
    },
    overlay: { ...StyleSheet.absoluteFillObject },
    overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    overlayMiddle: { flexDirection: 'row' },
    overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    scanArea: {
        width: SCAN_SIZE, height: SCAN_SIZE,
        borderWidth: 0,
    },
    overlayBottom: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center', paddingTop: spacing.xl,
    },
    scanText: { fontSize: 16, color: '#fff', fontWeight: '600' },
    retryBtn: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg, marginTop: spacing.md,
    },
    corner: {
        position: 'absolute', width: 30, height: 30,
        borderColor: '#6366F1', borderWidth: 3,
    },
    cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
});

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing, typography, borderRadius } from '../../theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { portalService } from '../../services/portal';
import { getApiErrorMessage } from '../../utils/error';
import { ActivityType, ACTIVITY_TYPE_LABELS } from '../../types/portal';
import type { HoursStackScreenProps } from '../../navigation/types';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface AddHourForm {
    projectName: string;
    hours: string;
    date: string;
    description: string;
    activityType: ActivityType;
    photoUrl: string;
    documentUrl: string;
}

type Props = HoursStackScreenProps<'AddHour'>;

export function AddHourScreen({ navigation }: Props) {
    const colors = useThemeColors();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<AddHourForm>({
        defaultValues: {
            projectName: '',
            hours: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            activityType: 'OTHER' as ActivityType,
            photoUrl: '',
            documentUrl: '',
        },
    });

    const selectedActivity = watch('activityType');

    const pickPhoto = async () => {
        const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permResult.granted) {
            Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri izni vermeniz gerekmektedir.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
            setValue('photoUrl', result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permResult.granted) {
            Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera izni vermeniz gerekmektedir.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
            setValue('photoUrl', result.assets[0].uri);
        }
    };

    const showPhotoOptions = () => {
        Alert.alert(
            'Fotoğraf Ekle',
            'Nasıl eklemek istersiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                { text: '📷 Kamera', onPress: takePhoto },
                { text: '🖼️ Galeri', onPress: pickPhoto },
            ],
        );
    };

    const onSubmit = async (form: AddHourForm) => {
        setLoading(true);
        try {
            if (isNaN(Number(form.hours)) || Number(form.hours) <= 0) {
                throw new Error('Geçerli bir saat giriniz.');
            }
            if (!form.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                throw new Error('Tarih formatı YYYY-MM-DD olmalıdır.');
            }

            await portalService.createHour({
                projectName: form.projectName,
                hours: Number(form.hours),
                date: new Date(form.date).toISOString(),
                description: form.description || undefined,
                activityType: form.activityType,
                photoUrl: form.photoUrl || undefined,
                documentUrl: form.documentUrl || undefined,
            });

            await queryClient.invalidateQueries({ queryKey: ['hours'] });
            await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

            Alert.alert('Başarılı', 'Gönüllülük saatiniz onaya gönderildi.', [
                { text: 'Tamam', onPress: () => navigation.goBack() },
            ]);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Kayıt başarısız.';
            Alert.alert('Hata', getApiErrorMessage(error, msg));
        } finally {
            setLoading(false);
        }
    };

    const activityOptions = Object.entries(ACTIVITY_TYPE_LABELS);

    return (
        <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                <View style={styles.formSection}>
                    <Text style={[typography.subtitle2, { color: colors.textSecondary, marginBottom: spacing.sm }]}>Etkinlik Türü</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md }}>
                        {activityOptions.map(([key, label]) => {
                            const isSelected = selectedActivity === key;
                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={[styles.chip, { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}
                                    onPress={() => setValue('activityType', key as ActivityType)}
                                >
                                    <Text style={[typography.caption, { color: isSelected ? '#fff' : colors.text, fontWeight: '600' }]}>{label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <Controller
                    control={control}
                    name="projectName"
                    rules={{ required: 'Proje adı zorunludur' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input label="Proje/Etkinlik Adı" placeholder="Örn: 23 Nisan Şenliği" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.projectName?.message} />
                    )}
                />

                <View style={styles.row}>
                    <View style={styles.flex}>
                        <Controller
                            control={control}
                            name="hours"
                            rules={{ required: 'Saat zorunludur' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input label="Süre (Saat)" placeholder="Örn: 4" keyboardType="numeric" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.hours?.message} />
                            )}
                        />
                    </View>
                    <View style={{ width: spacing.md }} />
                    <View style={styles.flex}>
                        <Controller
                            control={control}
                            name="date"
                            rules={{ required: 'Tarih zorunludur' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input label="Tarih" placeholder="YYYY-AA-GG" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.date?.message} icon="calendar-outline" />
                            )}
                        />
                    </View>
                </View>

                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input label="Açıklama (Opsiyonel)" placeholder="Görevleriniz nelerdi?" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.description?.message} multiline numberOfLines={3} />
                    )}
                />

                {/* Photo Upload Section */}
                <View style={styles.formSection}>
                    <Text style={[typography.subtitle2, { color: colors.textSecondary, marginBottom: spacing.sm }]}>📷 Kanıt Fotoğrafı (Opsiyonel)</Text>
                    {photoUri ? (
                        <View style={styles.photoPreviewContainer}>
                            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                            <TouchableOpacity
                                style={styles.photoRemoveBtn}
                                onPress={() => { setPhotoUri(null); setValue('photoUrl', ''); }}
                            >
                                <Ionicons name="close-circle" size={28} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.photoUploadBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={showPhotoOptions}
                        >
                            <Ionicons name="camera-outline" size={32} color={colors.primary} />
                            <Text style={[typography.body2, { color: colors.primary, marginTop: 4 }]}>Fotoğraf Ekle</Text>
                            <Text style={[typography.caption, { color: colors.textSecondary }]}>Kamera veya Galeri</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Controller
                    control={control}
                    name="documentUrl"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input label="Belge Linki (Opsiyonel)" placeholder="https://..." value={value} onChangeText={onChange} onBlur={onBlur} error={errors.documentUrl?.message} icon="document-outline" autoCapitalize="none" />
                    )}
                />

                <Button title="Gönder" onPress={handleSubmit(onSubmit)} loading={loading} style={{ marginTop: spacing.md }} />

                <View style={{ height: 50 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { padding: spacing.lg },
    row: { flexDirection: 'row' },
    formSection: { marginBottom: spacing.sm },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
    },
    photoUploadBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    photoPreviewContainer: {
        position: 'relative',
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    photoPreview: {
        width: '100%',
        height: 200,
        borderRadius: borderRadius.lg,
    },
    photoRemoveBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 14,
    },
});

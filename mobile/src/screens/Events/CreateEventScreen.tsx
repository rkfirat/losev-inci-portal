import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { useThemeColors } from '../../hooks/useThemeColors';
import { spacing, } from '../../theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { portalService } from '../../services/portal';
import { getApiErrorMessage } from '../../utils/error';
import { useNavigation } from '@react-navigation/native';

interface CreateEventForm {
    title: string;
    description: string;
    date: string;
    endDate: string;
    location: string;
    capacity: string;
}

export function CreateEventScreen() {
    const colors = useThemeColors();
    const navigation = useNavigation();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<CreateEventForm>({
        defaultValues: {
            title: '',
            description: '',
            date: '',
            endDate: '',
            location: '',
            capacity: '',
        },
    });

    const onSubmit = async (form: CreateEventForm) => {
        setLoading(true);
        try {
            if (!form.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                throw new Error('Tarih formatı YYYY-MM-DD olmalıdır.');
            }

            await portalService.createEvent({
                title: form.title,
                description: form.description || undefined,
                date: new Date(form.date).toISOString(),
                endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
                location: form.location || undefined,
                capacity: form.capacity ? Number(form.capacity) : undefined,
            });

            await queryClient.invalidateQueries({ queryKey: ['events'] });
            await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

            Alert.alert('Başarılı', 'Etkinlik oluşturuldu!', [
                { text: 'Tamam', onPress: () => navigation.goBack() },
            ]);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Etkinlik oluşturulamadı.';
            Alert.alert('Hata', getApiErrorMessage(error, msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Controller
                    control={control}
                    name="title"
                    rules={{ required: 'Etkinlik adı zorunludur' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input label="Etkinlik Adı" placeholder="Örn: LÖSEV Farkındalık Semineri" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
                    )}
                />

                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input label="Açıklama (Opsiyonel)" placeholder="Etkinlik detayları..." value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} />
                    )}
                />

                <View style={styles.row}>
                    <View style={styles.flex}>
                        <Controller
                            control={control}
                            name="date"
                            rules={{ required: 'Başlangıç tarihi zorunludur' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input label="Başlangıç Tarihi" placeholder="YYYY-AA-GG" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.date?.message} icon="calendar-outline" />
                            )}
                        />
                    </View>
                    <View style={{ width: spacing.md }} />
                    <View style={styles.flex}>
                        <Controller
                            control={control}
                            name="endDate"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input label="Bitiş Tarihi (Ops.)" placeholder="YYYY-AA-GG" value={value} onChangeText={onChange} onBlur={onBlur} icon="calendar-outline" />
                            )}
                        />
                    </View>
                </View>

                <Controller
                    control={control}
                    name="location"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input label="Konum (Opsiyonel)" placeholder="Örn: Atatürk Lisesi Konferans Salonu" value={value} onChangeText={onChange} onBlur={onBlur} icon="location-outline" />
                    )}
                />

                <Controller
                    control={control}
                    name="capacity"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input label="Kapasite (Opsiyonel)" placeholder="Örn: 50" keyboardType="numeric" value={value} onChangeText={onChange} onBlur={onBlur} icon="people-outline" />
                    )}
                />

                <Button title="Etkinlik Oluştur" onPress={handleSubmit(onSubmit)} loading={loading} style={{ marginTop: spacing.md }} />

                <View style={{ height: 50 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { padding: spacing.lg },
    row: { flexDirection: 'row' },
});

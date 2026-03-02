import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { VolunteerService } from '../../services/volunteer.service';

const logHoursSchema = z.object({
  projectName: z.string().min(1, 'Proje adı zorunludur'),
  hours: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Geçerli bir saat giriniz',
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih formatı YYYY-AA-GG olmalıdır'),
  description: z.string().optional(),
});

type LogHoursFormData = z.infer<typeof logHoursSchema>;

export const LogHoursScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LogHoursFormData>({
    resolver: zodResolver(logHoursSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    }
  });

  const onSubmit = async (data: LogHoursFormData) => {
    setLoading(true);
    try {
      const res = await VolunteerService.logHours({
        ...data,
        hours: Number(data.hours),
      });
      if (res.success) {
        Alert.alert('Başarılı', 'Gönüllülük saati başarıyla kaydedildi ve onaya gönderildi.');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Hata', 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.header}>Saat Logla</Text>
          <Text style={styles.subHeader}>Gönüllülük çalışmalarınızı sisteme ekleyin.</Text>

          <Controller
            control={control}
            name="projectName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Proje Adı / Etkinlik</Text>
                <TextInput
                  style={[styles.input, errors.projectName && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Örn: Mama Dağıtımı"
                />
                {errors.projectName && <Text style={styles.errorText}>{errors.projectName.message}</Text>}
              </View>
            )}
          />

          <View style={styles.row}>
            <Controller
              control={control}
              name="hours"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Süre (Saat)</Text>
                  <TextInput
                    style={[styles.input, errors.hours && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Örn: 2"
                    keyboardType="numeric"
                  />
                  {errors.hours && <Text style={styles.errorText}>{errors.hours.message}</Text>}
                </View>
              )}
            />
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputGroup, { flex: 1.5 }]}>
                  <Text style={styles.label}>Tarih (YYYY-AA-GG)</Text>
                  <TextInput
                    style={[styles.input, errors.date && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="2024-03-01"
                  />
                  {errors.date && <Text style={styles.errorText}>{errors.date.message}</Text>}
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Açıklama (Opsiyonel)</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Neler yaptığınızı kısaca anlatın..."
                  multiline
                />
              </View>
            )}
          />

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Kaydet ve Onaya Gönder</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Vazgeç</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E05A47',
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '600'
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333'
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  submitBtn: {
    backgroundColor: '#E05A47',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    padding: 15,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 14,
  }
});

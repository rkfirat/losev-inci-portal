import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useThemeColors } from '../../hooks/useThemeColors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authService } from '../../services/auth';
import { getApiErrorMessage } from '../../utils/error';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  city: string;
  district: string;
  grade: string;
  coordinatorName: string;
  password: string;
  confirmPassword: string;
}

interface Props {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
}

export const RegisterScreen = memo(function RegisterScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: { firstName: '', lastName: '', email: '', school: '', city: '', district: '', grade: '', coordinatorName: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (form: RegisterForm) => {
    setLoading(true);
    try {
      await authService.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        ...(form.school ? { school: form.school } : {}),
        ...(form.city ? { city: form.city } : {}),
        ...(form.district ? { district: form.district } : {}),
        ...(form.grade ? { grade: form.grade } : {}),
        ...(form.coordinatorName ? { coordinatorName: form.coordinatorName } : {}),
      });
    } catch (error: unknown) {
      Alert.alert('Hata', getApiErrorMessage(error, 'Kayıt başarısız. Lütfen tekrar deneyin.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[typography.h2, { color: colors.text }]}>Hesap Oluştur</Text>
          <Text style={[typography.body1, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            LÖSEV İnci Portalı'na katıl ve gönüllülük yolculuğuna başla.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Controller
                control={control}
                name="firstName"
                rules={{ required: 'Gerekli', maxLength: { value: 50, message: 'Çok uzun' } }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Ad"
                    placeholder="Elif"
                    icon="person-outline"
                    autoComplete="given-name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.firstName?.message}
                    testID="register-first-name"
                  />
                )}
              />
            </View>
            <View style={styles.nameSpacer} />
            <View style={styles.nameField}>
              <Controller
                control={control}
                name="lastName"
                rules={{ required: 'Gerekli', maxLength: { value: 50, message: 'Çok uzun' } }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Soyad"
                    placeholder="Yılmaz"
                    autoComplete="family-name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.lastName?.message}
                    testID="register-last-name"
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email gerekli',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Geçersiz email formatı',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="email@ornek.com"
                icon="mail-outline"
                keyboardType="email-address"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                testID="register-email"
              />
            )}
          />

          <Controller
            control={control}
            name="school"
            rules={{ maxLength: { value: 100, message: 'Çok uzun' } }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Okul (opsiyonel)"
                placeholder="42 İstanbul"
                icon="school-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.school?.message}
                testID="register-school"
              />
            )}
          />

          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Controller
                control={control}
                name="city"
                rules={{ maxLength: { value: 100, message: 'Çok uzun' } }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="İl (opsiyonel)"
                    placeholder="İstanbul"
                    icon="location-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.city?.message}
                    testID="register-city"
                  />
                )}
              />
            </View>
            <View style={styles.nameSpacer} />
            <View style={styles.nameField}>
              <Controller
                control={control}
                name="district"
                rules={{ maxLength: { value: 100, message: 'Çok uzun' } }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="İlçe (opsiyonel)"
                    placeholder="Kadıköy"
                    icon="location-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.district?.message}
                    testID="register-district"
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Controller
                control={control}
                name="grade"
                rules={{ maxLength: { value: 20, message: 'Çok uzun' } }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Sınıf (opsiyonel)"
                    placeholder="10"
                    icon="school-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.grade?.message}
                    testID="register-grade"
                  />
                )}
              />
            </View>
            <View style={styles.nameSpacer} />
            <View style={styles.nameField}>
              <Controller
                control={control}
                name="coordinatorName"
                rules={{ maxLength: { value: 100, message: 'Çok uzun' } }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Koordinatör (opsiyonel)"
                    placeholder="Öğretmen adı"
                    icon="person-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.coordinatorName?.message}
                    testID="register-coordinator"
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Şifre gerekli',
              minLength: { value: 8, message: 'En az 8 karakter' },
              validate: {
                uppercase: (v) => /[A-Z]/.test(v) || 'Büyük harf içermeli',
                lowercase: (v) => /[a-z]/.test(v) || 'Küçük harf içermeli',
                number: (v) => /[0-9]/.test(v) || 'Rakam içermeli',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Şifre"
                placeholder="En az 8 karakter"
                icon="lock-closed-outline"
                isPassword
                autoComplete="new-password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                testID="register-password"
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Şifreyi tekrar girin',
              validate: (v) => v === password || 'Şifreler eşleşmiyor',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Şifre Tekrar"
                placeholder="Şifrenizi tekrar girin"
                icon="lock-closed-outline"
                isPassword
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                testID="register-confirm-password"
              />
            )}
          />

          <Button
            title="Kayıt Ol"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            testID="register-submit"
          />
        </View>

        <View style={styles.footer}>
          <Text style={[typography.body2, { color: colors.textSecondary }]}>
            Zaten hesabın var mı?{' '}
          </Text>
          <Button
            title="Giriş Yap"
            onPress={() => navigation.navigate('Login')}
            variant="ghost"
            testID="register-login-link"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  form: {
    marginBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
  },
  nameField: {
    flex: 1,
  },
  nameSpacer: {
    width: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

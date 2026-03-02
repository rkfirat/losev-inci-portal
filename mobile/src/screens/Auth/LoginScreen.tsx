import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Linking from 'expo-linking';
import { AuthService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir E-posta giriniz'),
  password: z.string().min(1, 'Şifre zorunludur'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginScreen = ({ navigation }: any) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Handle Deep Linking for OAuth Callback
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { path, queryParams } = Linking.parse(event.url);
      
      if (path === 'auth/success' && queryParams) {
        const { accessToken, refreshToken } = queryParams as any;
        if (accessToken && refreshToken) {
          setOauthLoading(true);
          try {
            // Temporarily set tokens in store to fetch user info
            useAuthStore.getState().updateTokens({ accessToken, refreshToken, expiresIn: 3600 });
            
            const meRes = await AuthService.getMe();
            if (meRes.success) {
              setAuth(meRes.data, { accessToken, refreshToken, expiresIn: 3600 });
            } else {
              setErrorMsg('Kullanıcı bilgileri alınamadı.');
            }
          } catch (err) {
            console.error('OAuth Callback Error:', err);
            setErrorMsg('OAuth girişi sırasında bir hata oluştu.');
          } finally {
            setOauthLoading(false);
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await AuthService.login(data);
      if (!res.success) {
        setErrorMsg(res.error?.message || 'Giriş Başarısız');
      }
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        setErrorMsg(error.response.data.error.message);
      } else {
        setErrorMsg('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handle42Login = async () => {
    setErrorMsg('');
    setOauthLoading(true);
    try {
      const res = await AuthService.get42AuthUrl();
      if (res.success && res.data.authUrl) {
        Linking.openURL(res.data.authUrl);
      } else {
        setErrorMsg('42 giriş adresi alınamadı.');
      }
    } catch (error) {
      setErrorMsg('42 girişi başlatılamadı.');
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.headerTitle}>LÖSEV İnci Portalı</Text>
        <Text style={styles.subTitle}>Gönüllülük sistemine hoş geldiniz.</Text>

        {errorMsg !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{errorMsg}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-Posta</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="ornek@posta.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="******"
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            </View>
          )}
        />

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleSubmit(onSubmit)}
          disabled={loading || oauthLoading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Giriş Yap</Text>}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>VEYA</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity 
          style={styles.oauthBtn} 
          onPress={handle42Login}
          disabled={loading || oauthLoading}
        >
          {oauthLoading ? <ActivityIndicator color="#fff" /> : (
            <View style={styles.oauthContent}>
              <Text style={styles.oauthBtnText}>42 Intra ile Giriş Yap</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkBtn}>
          <Text style={styles.linkText}>Hesabınız yok mu? <Text style={styles.bold}>Kayıt Ol</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E05A47',
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 35,
    textAlign: 'center',
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
    padding: 14,
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
  submitBtn: {
    backgroundColor: '#E05A47',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: "#E05A47",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  oauthBtn: {
    backgroundColor: '#000000', // 42 Black
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  oauthContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oauthBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  linkBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
    color: '#E05A47',
  },
  errorBox: {
    backgroundColor: '#FFEBEA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFC1C0',
  },
  errorBoxText: {
    color: '#D8000C',
    textAlign: 'center',
    fontWeight: '500'
  }
});

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventsScreen } from '../screens/Events/EventsScreen';
import { CreateEventScreen } from '../screens/Events/CreateEventScreen';
import { QRScannerScreen } from '../screens/Events/QRScannerScreen';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAuthStore } from '../store/authStore';
import type { EventsStackParamList } from './types';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator<EventsStackParamList>();

export function EventsStackNavigator() {
    const colors = useThemeColors();
    const role = useAuthStore((s) => s.user?.role ?? 'STUDENT');

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="EventsMain"
                component={EventsScreen}
                options={({ navigation }) => ({
                    title: 'Etkinlikler',
                    headerRight: () =>
                        role !== 'STUDENT' ? (
                            <TouchableOpacity onPress={() => navigation.navigate('CreateEvent')}>
                                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        ) : null,
                })}
            />
            <Stack.Screen
                name="CreateEvent"
                component={CreateEventScreen}
                options={{ title: 'Etkinlik Oluştur' }}
            />
            <Stack.Screen
                name="QRScanner"
                component={QRScannerScreen}
                options={{ title: 'QR Okut', presentation: 'fullScreenModal' }}
            />
        </Stack.Navigator>
    );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HoursScreen } from '../screens/Hours/HoursScreen';
import { AddHourScreen } from '../screens/Hours/AddHourScreen';
import { useThemeColors } from '../hooks/useThemeColors';
import type { HoursStackParamList } from './types';

const Stack = createNativeStackNavigator<HoursStackParamList>();

export function HoursStackNavigator() {
    const colors = useThemeColors();

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                headerShadowVisible: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="HoursMain"
                component={HoursScreen}
                options={{ title: 'Saatler' }}
            />
            <Stack.Screen
                name="AddHour"
                component={AddHourScreen}
                options={{ title: 'Saat Ekle' }}
            />
        </Stack.Navigator>
    );
}

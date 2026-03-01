import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from './api';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const pushService = {
    /**
     * Register for push notifications and save token to backend
     */
    async registerForPushNotifications(): Promise<string | null> {
        if (!Device.isDevice) {
            console.log('Push notifications require a physical device');
            return null;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Push notification permission denied');
            return null;
        }

        // For Android, set notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Varsayılan',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#6366F1',
            });
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data;

        // Save token to backend
        try {
            await api.post('/auth/push-token', { pushToken: token });
        } catch (error) {
            console.log('Failed to save push token:', error);
        }

        return token;
    },

    /**
     * Schedule a local notification (for offline badge earned, etc.)
     */
    async scheduleLocalNotification(title: string, body: string, data?: Record<string, unknown>): Promise<void> {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: data ?? {},
                sound: true,
            },
            trigger: null, // immediate
        });
    },

    /**
     * Show badge earned notification
     */
    async notifyBadgeEarned(badgeName: string): Promise<void> {
        await this.scheduleLocalNotification(
            '🏅 Yeni Rozet Kazandın!',
            `Tebrikler! "${badgeName}" rozetini kazandın!`,
            { type: 'badge_earned', badgeName },
        );
    },

    /**
     * Show hour approved notification
     */
    async notifyHourApproved(projectName: string, hours: number): Promise<void> {
        await this.scheduleLocalNotification(
            '✅ Saat Onaylandı',
            `"${projectName}" projesindeki ${hours} saatlik gönüllülüğünüz onaylandı!`,
            { type: 'hour_approved', projectName },
        );
    },

    /**
     * Show hour rejected notification
     */
    async notifyHourRejected(projectName: string): Promise<void> {
        await this.scheduleLocalNotification(
            '❌ Saat Reddedildi',
            `"${projectName}" projesindeki gönüllülük saatiniz reddedildi. Detayları kontrol edin.`,
            { type: 'hour_rejected', projectName },
        );
    },

    /**
     * Show event reminder
     */
    async notifyEventReminder(eventTitle: string, date: string): Promise<void> {
        await this.scheduleLocalNotification(
            '📅 Etkinlik Hatırlatması',
            `"${eventTitle}" etkinliği ${date} tarihinde. Unutmayın!`,
            { type: 'event_reminder', eventTitle },
        );
    },
};

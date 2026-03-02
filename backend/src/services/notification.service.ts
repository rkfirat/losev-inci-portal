import logger from '../utils/logger';

export interface PushNotification {
  to: string;
  title: string;
  body: string;
  data?: any;
}

export class NotificationService {
  static async sendPushNotification(notification: PushNotification) {
    if (!notification.to || !notification.to.startsWith('ExponentPushToken')) {
      logger.warn(`Invalid push token: ${notification.to}`);
      return;
    }

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      const resData = await response.json();
      logger.info('Push notification sent', resData);
      return resData;
    } catch (error) {
      logger.error('Error sending push notification', error);
      throw error;
    }
  }

  static async notifyUser(userId: string, title: string, body: string, data?: any) {
    try {
      // Import prisma here to avoid circular dependencies if any
      const prisma = (await import('../config/database')).default;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pushToken: true }
      });

      if (user?.pushToken) {
        await this.sendPushNotification({
          to: user.pushToken,
          title,
          body,
          data
        });
      }
    } catch (error) {
      logger.error(`Failed to notify user ${userId}`, error);
    }
  }
}

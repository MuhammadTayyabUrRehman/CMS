import { Notification } from '@prisma/client';
import { NotificationEntity } from './entities/notification.entity';

export function mapNotificationToEntity(notification: Notification): NotificationEntity {
  return {
    id: notification.id,
    complaintId: notification.complaintId,
    recipientType: notification.recipientType,
    message: notification.message,
    isRead: notification.isRead,
    sentAt: notification.sentAt,
  };
}

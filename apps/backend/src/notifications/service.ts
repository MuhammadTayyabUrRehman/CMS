import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { NotificationEntity } from './entities/notification.entity';
import { mapNotificationToEntity } from './mapper';
import { NotificationsRepository } from './repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async createNotification(
    data: {
      complaintId: string;
      recipientType: string;
      message: string;
      type?: NotificationType;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<NotificationEntity> {
    const notification = await this.notificationsRepository.create(
      {
        complaint: { connect: { id: data.complaintId } },
        recipientType: data.recipientType,
        message: data.message,
      },
      tx,
    );

    return mapNotificationToEntity(
      notification as unknown as Parameters<typeof mapNotificationToEntity>[0],
    );
  }

  async getNotificationsForComplaint(complaintId: string): Promise<NotificationEntity[]> {
    const notifications = await this.notificationsRepository.findByComplaintId(complaintId);
    return notifications.map((notification) =>
      mapNotificationToEntity(
        notification as unknown as Parameters<typeof mapNotificationToEntity>[0],
      ),
    );
  }

  async listNotifications(recipientType: string): Promise<NotificationEntity[]> {
    const notifications = await this.notificationsRepository.findByRecipient(recipientType);
    return notifications.map((notification) =>
      mapNotificationToEntity(
        notification as unknown as Parameters<typeof mapNotificationToEntity>[0],
      ),
    );
  }

  async listUnreadVvipAlerts(): Promise<NotificationEntity[]> {
    const notifications = await this.notificationsRepository.findUnreadVvipAlerts();
    return notifications.map((notification) =>
      mapNotificationToEntity(
        notification as unknown as Parameters<typeof mapNotificationToEntity>[0],
      ),
    );
  }

  async listUnreadForComplainant(userId: string): Promise<NotificationEntity[]> {
    const notifications = await this.notificationsRepository.findUnreadForComplainant(userId);
    return notifications.map((notification) =>
      mapNotificationToEntity(
        notification as unknown as Parameters<typeof mapNotificationToEntity>[0],
      ),
    );
  }

  async markAsRead(notificationId: string): Promise<NotificationEntity | null> {
    const notification = await this.notificationsRepository.markRead(notificationId);
    if (!notification) {
      return null;
    }
    return mapNotificationToEntity(
      notification as unknown as Parameters<typeof mapNotificationToEntity>[0],
    );
  }

  async markVvipAlertAsRead(notificationId: string): Promise<NotificationEntity | null> {
    const notification = await this.notificationsRepository.markRead(notificationId, 'VVIP_ALERT');
    return notification
      ? mapNotificationToEntity(
          notification as unknown as Parameters<typeof mapNotificationToEntity>[0],
        )
      : null;
  }


  async markComplainantAsRead(
    notificationId: string,
    userId: string,
  ): Promise<NotificationEntity | null> {
    const notification = await this.notificationsRepository.markComplainantRead(
      notificationId,
      userId,
    );
    return notification
      ? mapNotificationToEntity(
          notification as unknown as Parameters<typeof mapNotificationToEntity>[0],
        )
      : null;
  }
}

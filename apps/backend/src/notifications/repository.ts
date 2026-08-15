import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.NotificationCreateInput, tx?: Prisma.TransactionClient): Promise<Prisma.NotificationGetPayload<{}>> {
    const client = tx ?? this.prisma;
    return client.notification.create({ data }) as Promise<Prisma.NotificationGetPayload<{}>>;
  }

  findByComplaintId(complaintId: string): Promise<Prisma.NotificationGetPayload<{}>[]> {
    return this.prisma.notification.findMany({
      where: { complaintId },
      orderBy: { sentAt: 'asc' },
    }) as Promise<Prisma.NotificationGetPayload<{}>[]>;
  }

  findByRecipient(recipientType: string): Promise<Prisma.NotificationGetPayload<{}>[]> {
    return this.prisma.notification.findMany({
      where: { recipientType },
      orderBy: { sentAt: 'desc' },
    }) as Promise<Prisma.NotificationGetPayload<{}>[]>;
  }

  findUnreadForComplainant(userId: string): Promise<Prisma.NotificationGetPayload<{}>[]> {
    return this.prisma.notification.findMany({
      where: {
        recipientType: 'COMPLAINANT',
        isRead: false,
        complaint: { submittedById: userId },
      },
      orderBy: { sentAt: 'desc' },
    }) as Promise<Prisma.NotificationGetPayload<{}>[]>;
  }

  findComplainantNotification(notificationId: string, userId: string) {
    return this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientType: 'COMPLAINANT',
        complaint: { submittedById: userId },
      },
    });
  }

  async markRead(notificationId: string): Promise<Prisma.NotificationGetPayload<{}> | null> {
    const exists = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!exists) {
      return null;
    }
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    }) as Promise<Prisma.NotificationGetPayload<{}>>;
  }


  async markComplainantRead(
    notificationId: string,
    userId: string,
  ): Promise<Prisma.NotificationGetPayload<{}> | null> {
    const owned = await this.findComplainantNotification(notificationId, userId);
    if (!owned) return null;
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}

export interface NotificationEntity {
  id: string;
  complaintId: string;
  recipientType: string;
  message: string;
  isRead: boolean;
  sentAt: Date;
}

import { Complaint, ComplaintUpdate, Notification, User } from '@prisma/client';
import { ComplaintDetailEntity, ComplaintEntity } from './entities/complaint.entity';

export function mapComplaintToEntity(complaint: Complaint): ComplaintEntity {
  return {
    id: complaint.id,
    complaintNumber: complaint.complaintNumber,
    roomNo: complaint.roomNo,
    block: complaint.block,
    rank: complaint.rank,
    category: complaint.category,
    contactMethod: complaint.contactMethod,
    contactNumber: complaint.contactNumber,
    description: complaint.description,
    status: complaint.status,
    submittedAt: complaint.submittedAt,
    updatedAt: complaint.updatedAt,
    timerExpiresAt: complaint.timerExpiresAt,
    priorityLevel: complaint.priorityLevel,
    technicianName: complaint.technicianName,
    dispatchTime: complaint.dispatchTime,
    assignedToId: complaint.assignedToId,
  };
}

export function mapComplaintDetailToEntity(
  complaint: Complaint & {
    updates: Array<ComplaintUpdate & { handledBy: User | null }>;
    notifications: Notification[];
    assignedTo: User | null;
  },
): ComplaintDetailEntity {
  return {
    ...mapComplaintToEntity(complaint),
    history: complaint.updates.map((update) => ({
      id: update.id,
      status: update.status,
      comment: update.comment,
      updateDate: update.updateDate,
      handledBy: update.handledBy
        ? {
            id: update.handledBy.id,
            fullName: update.handledBy.fullName,
          }
        : null,
    })),
    notifications: complaint.notifications.map((notification) => ({
      id: notification.id,
      message: notification.message,
      isRead: notification.isRead,
      sentAt: notification.sentAt,
    })),
    handler: complaint.assignedTo
      ? {
          id: complaint.assignedTo.id,
          fullName: complaint.assignedTo.fullName,
        }
      : null,
  };
}

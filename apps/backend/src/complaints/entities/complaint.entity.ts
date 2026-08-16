import { Category, ContactMethod, Status } from '@prisma/client';

export interface ComplaintEntity {
  id: string;
  complaintNumber: string;
  roomNo: string;
  block: string;
  rank: number;
  category: Category;
  contactMethod: ContactMethod;
  contactNumber: string;
  description: string;
  status: Status;
  submittedAt: Date;
  updatedAt: Date;
  timerExpiresAt: Date | null;
  priorityLevel: number;
  technicianName: string | null;
  dispatchTime: Date | null;
  responseTimeSeconds: number | null;
  assignedToId: string | null;
}

export interface ComplaintDetailEntity extends ComplaintEntity {
  history: Array<{
    id: string;
    status: Status;
    comment: string | null;
    updateDate: Date;
    handledBy: {
      id: string;
      fullName: string;
    } | null;
  }>;
  notifications: Array<{
    id: string;
    message: string;
    isRead: boolean;
    sentAt: Date;
  }>;
  handler: {
    id: string;
    fullName: string;
  } | null;
}

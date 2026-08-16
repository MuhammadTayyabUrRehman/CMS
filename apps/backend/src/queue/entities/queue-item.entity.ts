import { Category, ContactMethod, Status } from '@prisma/client';

export interface QueueItemEntity {
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
  priorityLevel: number;
  technicianName: string | null;
  dispatchTime: Date | null;
  responseTimeSeconds: number | null;
  assignedToId: string | null;
  timerExpiresAt: Date | null;
}

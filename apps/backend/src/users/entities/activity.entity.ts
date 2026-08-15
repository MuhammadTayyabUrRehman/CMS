import { Category, Status } from '@prisma/client';

export interface ComplaintActivityItem {
  id: string;
  complaintNumber: string;
  category: Category;
  status: Status;
  submittedAt: Date;
  role: 'ASSIGNED' | 'SUBMITTED';
}

export interface UserActivityEntity {
  id: string;
  fullName: string;
  employeeId: string;
  role: string;
  countsByStatus: Record<Status, number>;
  assignedComplaints: number;
  submittedComplaints: number;
  recentComplaints: ComplaintActivityItem[];
}

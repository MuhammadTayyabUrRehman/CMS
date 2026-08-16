import { Status } from '@prisma/client';

export interface DashboardSummaryEntity {
  totalComplaints: number;
  todaysComplaints: number;
  countsByStatus: Record<Status | 'PENDING', number>;
  vipComplaints: number;
  averageResponseTimeSeconds: number | null;
  complaintsByCategory: Record<string, number>;
}

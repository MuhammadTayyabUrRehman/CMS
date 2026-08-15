export interface StaffPerformanceEntity {
  id: string;
  fullName: string;
  assigned: number;
  resolved: number;
  escalated: number;
  averageCompletionSeconds: number | null;
  currentWorkload: number;
}

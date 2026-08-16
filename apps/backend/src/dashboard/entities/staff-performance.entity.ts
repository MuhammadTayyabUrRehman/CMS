export interface StaffPerformanceEntity {
  id: string;
  fullName: string;
  assigned: number;
  acknowledged: number;
  averageAcknowledgementSeconds: number | null;
  currentWorkload: number;
}

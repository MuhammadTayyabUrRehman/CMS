export interface AssignmentEntity {
  complaintId: string;
  technicianName: string;
  dispatchTime: Date;
  handledBy: {
    id: string;
    fullName: string;
  };
  status: string;
}

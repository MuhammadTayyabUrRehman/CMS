import { Status } from '@prisma/client';

export interface HistoryEntryEntity {
  id: string;
  complaintId: string;
  status: Status;
  comment: string | null;
  updateDate: Date;
  handledBy: {
    id: string;
    fullName: string;
  } | null;
}

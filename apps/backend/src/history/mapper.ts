import { ComplaintUpdate, User } from '@prisma/client';
import { HistoryEntryEntity } from './entities/history-entry.entity';

export function mapHistoryEntryToEntity(update: ComplaintUpdate & { handledBy: User | null }): HistoryEntryEntity {
  return {
    id: update.id,
    complaintId: update.complaintId,
    status: update.status,
    comment: update.comment,
    updateDate: update.updateDate,
    handledBy: update.handledBy
      ? {
          id: update.handledBy.id,
          fullName: update.handledBy.fullName,
        }
      : null,
  };
}

import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { HistoryEntryEntity } from './entities/history-entry.entity';
import { mapHistoryEntryToEntity } from './mapper';
import { HistoryRepository } from './repository';

@Injectable()
export class HistoryService {
  constructor(private readonly historyRepository: HistoryRepository) {}

  async createHistoryEntry(
    data: {
      complaintId: string;
      status: Status;
      handledById: string | null;
      comment: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<HistoryEntryEntity> {
    const entry = await this.historyRepository.create(
      {
        complaint: { connect: { id: data.complaintId } },
        status: data.status,
        comment: data.comment,
        ...(data.handledById
          ? {
              handledBy: { connect: { id: data.handledById } },
            }
          : {}),
      },
      tx,
    );

    return mapHistoryEntryToEntity(entry as unknown as Parameters<typeof mapHistoryEntryToEntity>[0]);
  }

  async getComplaintHistory(complaintId: string): Promise<HistoryEntryEntity[]> {
    const entries = await this.historyRepository.findByComplaintId(complaintId);
    return entries.map((entry) =>
      mapHistoryEntryToEntity(entry as unknown as Parameters<typeof mapHistoryEntryToEntity>[0]),
    );
  }
}

import { Injectable } from '@nestjs/common';
import { QueueRepository } from './repository';
import { QueryQueueDto } from './dto/query-queue.dto';
import { Complaint, Prisma, Status } from '@prisma/client';
import { mapComplaintToQueueItem } from './mapper';
import { QueueItemEntity } from './entities/queue-item.entity';

@Injectable()
export class QueueService {
  constructor(private readonly repo: QueueRepository) {}

  async getQueue(query: QueryQueueDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ComplaintWhereInput = {};

    if (query.status) {
      where.status = query.status as Status;
    } else {
      // Work queue defaults to actionable complaints only.
      where.status = Status.NEW;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.block) {
      where.block = { contains: query.block, mode: 'insensitive' };
    }

    if (query.rank) {
      where.rank = query.rank;
    }

    if (query.assignedToId) {
      where.assignedToId = query.assignedToId;
    }

    if (query.startDate || query.endDate) {
      where.submittedAt = {};
      if (query.startDate) {
        where.submittedAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.submittedAt.lte = new Date(query.endDate);
      }
    }

    if (query.search) {
      const s = query.search;
      where.OR = [
        { description: { contains: s, mode: 'insensitive' } },
        { complaintNumber: { contains: s, mode: 'insensitive' } },
        { contactNumber: { contains: s, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.Enumerable<Prisma.ComplaintOrderByWithRelationInput> = [
      { priorityLevel: 'desc' },
      { submittedAt: 'asc' },
    ];

    const select = {
      id: true,
      complaintNumber: true,
      roomNo: true,
      block: true,
      rank: true,
      category: true,
      contactMethod: true,
      contactNumber: true,
      description: true,
      status: true,
      submittedAt: true,
      priorityLevel: true,
      technicianName: true,
      dispatchTime: true,
      responseTimeSeconds: true,
      assignedToId: true,
      timerExpiresAt: true,
    } satisfies Prisma.ComplaintSelect;

    const [items, total] = await Promise.all([
      this.repo.findMany({ where, skip, take: limit, orderBy, select }),
      this.repo.count(where),
    ]);

    const data: QueueItemEntity[] = (items as unknown as Complaint[]).map(
      mapComplaintToQueueItem,
    );

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }
}

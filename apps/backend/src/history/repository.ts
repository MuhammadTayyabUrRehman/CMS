import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/service';

@Injectable()
export class HistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ComplaintUpdateCreateInput, tx?: Prisma.TransactionClient): Promise<Prisma.ComplaintUpdateGetPayload<{}>> {
    const client = tx ?? this.prisma;
    return client.complaintUpdate.create({
      data,
      include: {
        handledBy: true,
      },
    }) as Promise<Prisma.ComplaintUpdateGetPayload<{}>>;
  }

  findByComplaintId(complaintId: string): Promise<Prisma.ComplaintUpdateGetPayload<{ include: { handledBy: true } }>[]> {
    return this.prisma.complaintUpdate.findMany({
      where: { complaintId },
      include: {
        handledBy: true,
      },
      orderBy: { updateDate: 'asc' },
    }) as Promise<Prisma.ComplaintUpdateGetPayload<{ include: { handledBy: true } }>[]>;
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { PrismaService } from '../database/service';

@Injectable()
export class ComplaintsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ComplaintCreateInput, tx?: Prisma.TransactionClient): Promise<Prisma.ComplaintGetPayload<{}>> {
    const client = tx ?? this.prisma;
    return client.complaint.create({ data }) as Promise<Prisma.ComplaintGetPayload<{}>>;
  }

  findById(id: string): Promise<Prisma.ComplaintGetPayload<{ include: { updates: true; notifications: true; assignedTo: true } }> | null> {
    return this.prisma.complaint.findUnique({
      where: { id },
      include: {
        updates: {
          include: {
            handledBy: true,
          },
        },
        notifications: true,
        assignedTo: true,
      },
    }) as Promise<Prisma.ComplaintGetPayload<{ include: { updates: true; notifications: true; assignedTo: true } }> | null>;
  }

  findMineById(
    id: string,
    userId: string,
  ): Promise<Prisma.ComplaintGetPayload<{ include: { updates: true; notifications: true; assignedTo: true } }> | null> {
    return this.prisma.complaint.findFirst({
      where: { id, submittedById: userId },
      include: {
        updates: {
          include: {
            handledBy: true,
          },
        },
        notifications: true,
        assignedTo: true,
      },
    }) as Promise<Prisma.ComplaintGetPayload<{ include: { updates: true; notifications: true; assignedTo: true } }> | null>;
  }

  findGuestTrackingByToken(trackingToken: string): Promise<{
    status: Status;
    technicianName: string | null;
  } | null> {
    return this.prisma.complaint.findUnique({
      where: { trackingToken },
      select: {
        status: true,
        technicianName: true,
      },
    });
  }

  findByIdWithTransaction(
    id: string,
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.ComplaintGetPayload<{ include: { updates: true; notifications: true; assignedTo: true } }> | null> {
    return tx.complaint.findUnique({
      where: { id },
      include: {
        updates: {
          include: {
            handledBy: true,
          },
        },
        notifications: true,
        assignedTo: true,
      },
    }) as Promise<Prisma.ComplaintGetPayload<{ include: { updates: true; notifications: true; assignedTo: true } }> | null>;
  }

  findMany(params: {
    where?: Prisma.ComplaintWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.Enumerable<Prisma.ComplaintOrderByWithRelationInput>;
  }): Promise<Prisma.ComplaintGetPayload<{}>[]> {
    return this.prisma.complaint.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
    }) as Promise<Prisma.ComplaintGetPayload<{}>[]>;
  }

  count(where?: Prisma.ComplaintWhereInput): Promise<number> {
    return this.prisma.complaint.count({ where });
  }

  update(id: string, data: Prisma.ComplaintUpdateInput): Promise<Prisma.ComplaintGetPayload<{}>> {
    return this.prisma.complaint.update({
      where: { id },
      data,
    }) as Promise<Prisma.ComplaintGetPayload<{}>>;
  }

  updateWithTransaction(id: string, data: Prisma.ComplaintUpdateInput, tx?: Prisma.TransactionClient): Promise<Prisma.ComplaintGetPayload<{}>> {
    const client = tx ?? this.prisma;
    return client.complaint.update({
      where: { id },
      data,
    }) as Promise<Prisma.ComplaintGetPayload<{}>>;
  }

  /**
   * Optimistically transition a complaint from `currentStatus` to `nextStatus`.
   * Returns the number of rows updated (0 if the status changed concurrently).
   */
  updateStatusWithTransaction(
    id: string,
    currentStatus: Status,
    nextStatus: Status,
    tx?: Prisma.TransactionClient,
  ): Promise<{ count: number }> {
    const client = tx ?? this.prisma;
    return client.complaint.updateMany({
      where: { id, status: currentStatus },
      data: {
        status: nextStatus,
        updatedAt: new Date(),
      },
    });
  }

  findFirstByComplaintNumber(complaintNumber: string): Promise<Prisma.ComplaintGetPayload<{}> | null> {
    return this.prisma.complaint.findFirst({ where: { complaintNumber } }) as Promise<Prisma.ComplaintGetPayload<{}> | null>;
  }

  findLatestByYear(year: number): Promise<Prisma.ComplaintGetPayload<{}> | null> {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    return this.prisma.complaint.findFirst({
      where: {
        submittedAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: {
        complaintNumber: 'desc',
      },
    }) as Promise<Prisma.ComplaintGetPayload<{}> | null>;
  }
}

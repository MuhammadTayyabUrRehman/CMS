import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/service';

@Injectable()
export class QueueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: {
    where?: Prisma.ComplaintWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.Enumerable<Prisma.ComplaintOrderByWithRelationInput>;
    select?: any;
  }) {
    return this.prisma.complaint.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
      select: params.select,
    });
  }

  async count(where?: Prisma.ComplaintWhereInput) {
    return this.prisma.complaint.count({ where });
  }
}

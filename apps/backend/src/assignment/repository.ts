import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/service';

@Injectable()
export class AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Prisma.ComplaintGetPayload<{}> | null> {
    return this.prisma.complaint.findUnique({ where: { id } }) as Promise<Prisma.ComplaintGetPayload<{}> | null>;
  }
}

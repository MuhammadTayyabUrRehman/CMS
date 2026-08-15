import { Injectable } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from '../database/service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByEmployeeId(employeeId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { employeeId } });
  }

  findManyByRole(role: Role): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { role },
      orderBy: { fullName: 'asc' },
    });
  }

  findMany(where?: Prisma.UserWhereInput): Promise<User[]> {
    return this.prisma.user.findMany({
      where,
      orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
    });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  countByStatusForUser(userId: string, relation: 'assignedTo' | 'submittedBy') {
    return this.prisma.complaint.groupBy({
      by: ['status'],
      where: relation === 'assignedTo' ? { assignedToId: userId } : { submittedById: userId },
      _count: { id: true },
    });
  }

  countComplaintsForUser(userId: string, relation: 'assignedTo' | 'submittedBy') {
    return this.prisma.complaint.count({
      where: relation === 'assignedTo' ? { assignedToId: userId } : { submittedById: userId },
    });
  }

  findRecentComplaintsForUser(
    userId: string,
    take = 10,
  ): Promise<Array<{ id: string; complaintNumber: string; category: string; status: string; submittedAt: Date; assignedToId: string | null; submittedById: string | null }>> {
    return this.prisma.complaint.findMany({
      where: { OR: [{ assignedToId: userId }, { submittedById: userId }] },
      orderBy: { submittedAt: 'desc' },
      take,
      select: {
        id: true,
        complaintNumber: true,
        category: true,
        status: true,
        submittedAt: true,
        assignedToId: true,
        submittedById: true,
      },
    });
  }
}

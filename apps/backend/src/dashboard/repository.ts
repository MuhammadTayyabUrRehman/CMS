import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { PrismaService } from '../database/service';
import { BucketUnit } from './bucketing.util';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countComplaints(where?: Prisma.ComplaintWhereInput) {
    return this.prisma.complaint.count({ where });
  }

  async countComplaintsByTimeBucket(
    unit: BucketUnit,
    start: Date,
    statuses?: Status[],
  ): Promise<Array<{ bucket: Date; count: number }>> {
    const statusClause = statuses && statuses.length
      ? Prisma.sql`AND "status"::text IN (${Prisma.join(statuses)})`
      : Prisma.empty;
    const rows = await this.prisma.$queryRaw<Array<{ bucket: Date; count: bigint }>>(
      Prisma.sql`
        SELECT date_trunc(${unit}, "submittedAt") AS bucket, COUNT(*)::int AS count
        FROM "complaints"
        WHERE "submittedAt" >= ${start}
        ${statusClause}
        GROUP BY bucket
        ORDER BY bucket ASC
      `,
    );
    return rows.map((r) => ({ bucket: new Date(r.bucket), count: Number(r.count) }));
  }

  async countComplaintsByStatus() {
    const rows = await this.prisma.complaint.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    return rows.reduce((acc, r) => {
      acc[r.status] = r._count.id;
      return acc;
    }, {} as Record<string, number>);
  }

  async complaintsByCategory() {
    const rows = await this.prisma.complaint.groupBy({
      by: ['category'],
      _count: { id: true },
    });
    return rows.reduce((acc, r) => {
      acc[r.category as unknown as string] = r._count.id;
      return acc;
    }, {} as Record<string, number>);
  }

  async getTopRankThreshold(percentile = 0.05) {
    const total = await this.prisma.complaint.count();
    if (total === 0) return null;
    const n = Math.max(1, Math.ceil(total * percentile));
    // get nth highest rank
    const rows = await this.prisma.complaint.findMany({
      orderBy: { rank: 'desc' },
      skip: n - 1,
      take: 1,
      select: { rank: true },
    });
    return rows.length ? rows[0].rank : null;
  }

  async countVipByRankThreshold(rankThreshold: number) {
    return this.prisma.complaint.count({ where: { rank: { gte: rankThreshold } } });
  }

  async earliestResponsePerComplaint() {
    // earliest update where status ACKNOWLEDGED or IN_PROGRESS
    const rows = await this.prisma.complaintUpdate.groupBy({
      by: ['complaintId'],
      where: { status: { in: ['ACKNOWLEDGED', 'IN_PROGRESS'] } },
      _min: { updateDate: true },
    });
    return rows.map((r) => ({ complaintId: r.complaintId, respondedAt: r._min.updateDate }));
  }

  async earliestResolvedPerComplaint() {
    const rows = await this.prisma.complaintUpdate.groupBy({
      by: ['complaintId'],
      where: { status: 'RESOLVED' },
      _min: { updateDate: true },
    });
    return rows.map((r) => ({ complaintId: r.complaintId, resolvedAt: r._min.updateDate }));
  }

  async findComplaintsByIds(ids: string[]) {
    return this.prisma.complaint.findMany({ where: { id: { in: ids } }, select: { id: true, submittedAt: true } });
  }

  async findStaff() {
    return this.prisma.user.findMany({ where: { role: 'IT_STAFF' }, select: { id: true, fullName: true } });
  }

  async countAssignedGrouped() {
    // grouped by assignedToId where status is ACKNOWLEDGED or IN_PROGRESS
    const rows = await this.prisma.complaint.groupBy({
      by: ['assignedToId'],
      where: { assignedToId: { not: null }, status: { in: ['ACKNOWLEDGED', 'IN_PROGRESS'] } },
      _count: { id: true },
    });
    return rows as Array<{ assignedToId: string | null; _count: { id: number } }>;
  }

  async countResolvedGrouped() {
    const rows = await this.prisma.complaintUpdate.groupBy({
      by: ['handledById'],
      where: { status: 'RESOLVED', handledById: { not: null } },
      _count: { id: true },
    });
    return rows as Array<{ handledById: string | null; _count: { id: number } }>;
  }

  async countEscalatedGrouped() {
    const rows = await this.prisma.complaintUpdate.groupBy({
      by: ['handledById'],
      where: { status: 'ESCALATED', handledById: { not: null } },
      _count: { id: true },
    });
    return rows as Array<{ handledById: string | null; _count: { id: number } }>;
  }

  async resolvedUpdatesDetailed() {
    return this.prisma.complaintUpdate.findMany({
      where: { status: 'RESOLVED', handledById: { not: null } },
      select: { complaintId: true, handledById: true, updateDate: true },
    });
  }
}

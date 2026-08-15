import { Injectable, Logger } from '@nestjs/common';
import { Status } from '@prisma/client';
import { DashboardRepository } from './repository';
import { DashboardSummaryEntity } from './entities/dashboard-summary.entity';
import { StaffPerformanceEntity } from './entities/staff-performance.entity';
import {
  ResolvedEscalatedEntity,
  TrendBucketEntity,
  TrendEntity,
} from './entities/trend.entity';
import { TrendPeriod } from './dto/trend-period.dto';
import { addToBucket, formatBucketLabel, getBucketWindow } from './bucketing.util';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  constructor(private readonly repo: DashboardRepository) {}

  async getSummary(): Promise<DashboardSummaryEntity> {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Run all independent aggregations in parallel.
    const [
      totalComplaints,
      todaysComplaints,
      countsByStatusRaw,
      rankThreshold,
      complaintsByCategory,
    ] = await Promise.all([
      this.repo.countComplaints(),
      this.repo.countComplaints({ submittedAt: { gte: todayStart, lt: todayEnd } }),
      this.repo.countComplaintsByStatus(),
      this.repo.getTopRankThreshold(0.05),
      this.repo.complaintsByCategory(),
    ]);

    const countsByStatus = { ...countsByStatusRaw } as Record<string, number>;
    ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'].forEach((s) => {
      if (!countsByStatus[s]) countsByStatus[s] = 0;
    });

    const vipComplaints = rankThreshold
      ? await this.repo.countVipByRankThreshold(rankThreshold)
      : 0;

    // Average response time (submittedAt -> first ACKNOWLEDGED/IN_PROGRESS) and
    // average resolution time (submittedAt -> first RESOLVED).
    const [earliestResponses, earliestResolved] = await Promise.all([
      this.repo.earliestResponsePerComplaint(),
      this.repo.earliestResolvedPerComplaint(),
    ]);

    const responseIds = earliestResponses.map((r) => r.complaintId);
    const resolvedIds = earliestResolved.map((r) => r.complaintId);
    const [responseComplaints, resolvedComplaints] = await Promise.all([
      responseIds.length ? this.repo.findComplaintsByIds(responseIds) : Promise.resolve([]),
      resolvedIds.length ? this.repo.findComplaintsByIds(resolvedIds) : Promise.resolve([]),
    ]);

    const averageResponseTimeSeconds = this.averageSeconds(
      earliestResponses,
      responseComplaints,
      (r) => r.respondedAt,
    );
    const averageResolutionTimeSeconds = this.averageSeconds(
      earliestResolved,
      resolvedComplaints,
      (r) => r.resolvedAt,
    );

    return {
      totalComplaints,
      todaysComplaints,
      countsByStatus: countsByStatus as DashboardSummaryEntity['countsByStatus'],
      vipComplaints,
      averageResponseTimeSeconds,
      averageResolutionTimeSeconds,
      complaintsByCategory,
    };
  }

  private averageSeconds(
    rows: Array<{ complaintId: string; respondedAt?: Date | null; resolvedAt?: Date | null }>,
    complaints: Array<{ id: string; submittedAt: Date }>,
    pick: (row: (typeof rows)[number]) => Date | null | undefined,
  ): number | null {
    if (!rows.length) return null;
    const byId = new Map(complaints.map((c) => [c.id, c.submittedAt]));
    const diffs: number[] = [];
    for (const r of rows) {
      const submittedAt = byId.get(r.complaintId);
      const at = pick(r);
      if (submittedAt && at) {
        diffs.push((at.getTime() - submittedAt.getTime()) / 1000);
      }
    }
    if (!diffs.length) return null;
    return diffs.reduce((a, b) => a + b, 0) / diffs.length;
  }

  async getStaffPerformance(): Promise<StaffPerformanceEntity[]> {    const [staff, assignedGrouped, resolvedGrouped, escalatedGrouped, resolvedDetails] =
      await Promise.all([
        this.repo.findStaff(),
        this.repo.countAssignedGrouped(),
        this.repo.countResolvedGrouped(),
        this.repo.countEscalatedGrouped(),
        this.repo.resolvedUpdatesDetailed(),
      ]);

    const complaintIds = Array.from(new Set(resolvedDetails.map((d) => d.complaintId)));
    const complaints = complaintIds.length
      ? await this.repo.findComplaintsByIds(complaintIds)
      : [];
    const submittedById = new Map(complaints.map((c) => [c.id, c.submittedAt]));

    const assignedMap = new Map(assignedGrouped.map((r) => [r.assignedToId as string, r._count.id]));
    const resolvedMap = new Map(resolvedGrouped.map((r) => [r.handledById as string, r._count.id]));
    const escalatedMap = new Map(escalatedGrouped.map((r) => [r.handledById as string, r._count.id]));

    const completionMap = new Map<string, number[]>();
    for (const d of resolvedDetails) {
      if (!d.handledById) continue;
      const submittedAt = submittedById.get(d.complaintId);
      if (!submittedAt) continue;
      const seconds = (d.updateDate.getTime() - submittedAt.getTime()) / 1000;
      const arr = completionMap.get(d.handledById) ?? [];
      arr.push(seconds);
      completionMap.set(d.handledById, arr);
    }

    return staff.map((s) => {
      const resolvedArr = completionMap.get(s.id) ?? [];
      const averageCompletionSeconds = resolvedArr.length
        ? resolvedArr.reduce((a, b) => a + b, 0) / resolvedArr.length
        : null;
      const currentWorkload = assignedMap.get(s.id) ?? 0;

      return {
        id: s.id,
        fullName: s.fullName,
        assigned: currentWorkload,
        resolved: resolvedMap.get(s.id) ?? 0,
        escalated: escalatedMap.get(s.id) ?? 0,
        averageCompletionSeconds,
        currentWorkload,
      };
    });
  }

  async getTrends(period: TrendPeriod): Promise<TrendEntity> {
    const { unit, start, count } = getBucketWindow(period);
    const rows = await this.repo.countComplaintsByTimeBucket(unit, start);
    const byBucket = new Map(rows.map((r) => [r.bucket.getTime(), r.count]));
    const buckets: TrendBucketEntity[] = [];
    for (let i = 0; i < count; i++) {
      const bucket = addToBucket(start, unit, i);
      buckets.push({
        bucket: bucket.toISOString(),
        label: formatBucketLabel(bucket, unit),
        count: byBucket.get(bucket.getTime()) ?? 0,
      });
    }
    return { period, buckets };
  }

  async getResolvedEscalatedTrend(period: TrendPeriod): Promise<ResolvedEscalatedEntity> {
    const { unit, start, count } = getBucketWindow(period);
    const [resolvedRows, escalatedRows] = await Promise.all([
      this.repo.countComplaintsByTimeBucket(unit, start, [Status.RESOLVED]),
      this.repo.countComplaintsByTimeBucket(unit, start, [Status.ESCALATED]),
    ]);
    const resolvedMap = new Map(resolvedRows.map((r) => [r.bucket.getTime(), r.count]));
    const escalatedMap = new Map(escalatedRows.map((r) => [r.bucket.getTime(), r.count]));
    const buckets = [];
    for (let i = 0; i < count; i++) {
      const bucket = addToBucket(start, unit, i);
      const ts = bucket.getTime();
      buckets.push({
        bucket: bucket.toISOString(),
        label: formatBucketLabel(bucket, unit),
        resolved: resolvedMap.get(ts) ?? 0,
        escalated: escalatedMap.get(ts) ?? 0,
      });
    }
    return { period, buckets };
  }
}

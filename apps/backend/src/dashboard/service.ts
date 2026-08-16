import { Injectable, Logger } from '@nestjs/common';
import { Status } from '@prisma/client';
import { DashboardRepository } from './repository';
import { DashboardSummaryEntity } from './entities/dashboard-summary.entity';
import { StaffPerformanceEntity } from './entities/staff-performance.entity';
import {
  NewAcknowledgedEntity,
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
    ['NEW', 'ACKNOWLEDGED'].forEach((s) => {
      if (!countsByStatus[s]) countsByStatus[s] = 0;
    });

    const vipComplaints = rankThreshold
      ? await this.repo.countVipByRankThreshold(rankThreshold)
      : 0;

    // Dispatch/acknowledgement freezes the final response time.
    const earliestResponses = await this.repo.earliestResponsePerComplaint();

    const responseIds = earliestResponses.map((r) => r.complaintId);
    const responseComplaints = responseIds.length
      ? await this.repo.findComplaintsByIds(responseIds)
      : [];

    const averageResponseTimeSeconds = this.averageSeconds(
      earliestResponses,
      responseComplaints,
      (r) => r.respondedAt,
    );

    return {
      totalComplaints,
      todaysComplaints,
      countsByStatus: countsByStatus as DashboardSummaryEntity['countsByStatus'],
      vipComplaints,
      averageResponseTimeSeconds,
      complaintsByCategory,
    };
  }

  private averageSeconds(
    rows: Array<{ complaintId: string; respondedAt?: Date | null }>,
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

  async getStaffPerformance(): Promise<StaffPerformanceEntity[]> {    const [staff, assignedGrouped, acknowledgedGrouped, acknowledgedDetails] =
      await Promise.all([
        this.repo.findStaff(),
        this.repo.countAssignedGrouped(),
        this.repo.countAcknowledgedGrouped(),
        this.repo.acknowledgedUpdatesDetailed(),
      ]);

    const complaintIds = Array.from(new Set(acknowledgedDetails.map((d) => d.complaintId)));
    const complaints = complaintIds.length
      ? await this.repo.findComplaintsByIds(complaintIds)
      : [];
    const submittedById = new Map(complaints.map((c) => [c.id, c.submittedAt]));

    const assignedMap = new Map(assignedGrouped.map((r) => [r.assignedToId as string, r._count.id]));
    const acknowledgedMap = new Map(acknowledgedGrouped.map((r) => [r.handledById as string, r._count.id]));

    const completionMap = new Map<string, number[]>();
    for (const d of acknowledgedDetails) {
      if (!d.handledById) continue;
      const submittedAt = submittedById.get(d.complaintId);
      if (!submittedAt) continue;
      const seconds = (d.updateDate.getTime() - submittedAt.getTime()) / 1000;
      const arr = completionMap.get(d.handledById) ?? [];
      arr.push(seconds);
      completionMap.set(d.handledById, arr);
    }

    return staff.map((s) => {
      const acknowledgedArr = completionMap.get(s.id) ?? [];
      const averageAcknowledgementSeconds = acknowledgedArr.length
        ? acknowledgedArr.reduce((a, b) => a + b, 0) / acknowledgedArr.length
        : null;
      const currentWorkload = assignedMap.get(s.id) ?? 0;

      return {
        id: s.id,
        fullName: s.fullName,
        assigned: currentWorkload,
        acknowledged: acknowledgedMap.get(s.id) ?? 0,
        averageAcknowledgementSeconds,
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

  async getNewAcknowledgedTrend(period: TrendPeriod): Promise<NewAcknowledgedEntity> {
    const { unit, start, count } = getBucketWindow(period);
    const [newRows, acknowledgedRows] = await Promise.all([
      this.repo.countComplaintsByTimeBucket(unit, start, [Status.NEW]),
      this.repo.countComplaintsByTimeBucket(unit, start, [Status.ACKNOWLEDGED]),
    ]);
    const newMap = new Map(newRows.map((r) => [r.bucket.getTime(), r.count]));
    const acknowledgedMap = new Map(acknowledgedRows.map((r) => [r.bucket.getTime(), r.count]));
    const buckets = [];
    for (let i = 0; i < count; i++) {
      const bucket = addToBucket(start, unit, i);
      const ts = bucket.getTime();
      buckets.push({
        bucket: bucket.toISOString(),
        label: formatBucketLabel(bucket, unit),
        new: newMap.get(ts) ?? 0,
        acknowledged: acknowledgedMap.get(ts) ?? 0,
      });
    }
    return { period, buckets };
  }
}

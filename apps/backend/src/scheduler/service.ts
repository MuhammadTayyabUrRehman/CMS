import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Status } from '@prisma/client';
import { ComplaintsRepository } from '../complaints/repository';
import { PrismaService } from '../database/service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly complaintsRepo: ComplaintsRepository,
    private readonly prisma: PrismaService,
  ) {}

  // Job 1: Expired Complaint Scanner - runs every minute.
  // Any complaint whose response timer has expired and is not yet
  // resolved/closed is automatically escalated.
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredComplaints() {
    try {
      const now = new Date();
      this.logger.debug('Running expired complaint scanner at ' + now.toISOString());

      const toEscalate = await this.complaintsRepo.findMany({
        where: {
          status: { in: [Status.NEW, Status.ACKNOWLEDGED, Status.IN_PROGRESS] },
          timerExpiresAt: { lte: now },
        },
      });

      for (const c of toEscalate) {
        await this.escalateComplaint(c.id);
      }
    } catch (err) {
      this.logger.error('Error in expired complaint scanner', err as any);
    }
  }

  private async escalateComplaint(complaintId: string): Promise<void> {
    const now = new Date();
    // Idempotent escalation inside a transaction.
    await this.prisma.$transaction(async (tx) => {
      // Atomic claim: only one concurrent scheduler run (e.g. across PM2
      // cluster instances) can win this conditional update, since it only
      // matches rows still in an escalatable status. This avoids duplicate
      // ComplaintUpdate/Notification rows if multiple instances race on the
      // same complaint in the same tick.
      const { count } = await tx.complaint.updateMany({
        where: {
          id: complaintId,
          status: { in: [Status.NEW, Status.ACKNOWLEDGED, Status.IN_PROGRESS] },
          timerExpiresAt: { lte: now },
        },
        data: { status: Status.ESCALATED, updatedAt: now },
      });
      if (count === 0) return; // already handled by another run, or no longer expired

      const current = await tx.complaint.findUnique({ where: { id: complaintId } });
      if (!current) return;

      await tx.complaintUpdate.create({
        data: {
          complaintId,
          status: Status.ESCALATED,
          comment: 'Automatically escalated by scheduler due to timeout',
        },
      });

      await tx.notification.create({
        data: {
          complaintId,
          recipientType: 'IT_STAFF',
          message: `Complaint ${current.complaintNumber} has been escalated due to timeout.`,
        },
      });
    });

    this.logger.log(`Escalated complaint ${complaintId}`);
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomBytes, randomUUID } from 'node:crypto';
import { Prisma, Status } from '@prisma/client';
import { PrismaService } from '../database/service';
import { HistoryService } from '../history/service';
import { NotificationsService } from '../notifications/service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { QueryComplaintsDto } from './dto/query-complaints.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ComplaintDetailEntity, ComplaintEntity } from './entities/complaint.entity';
import { mapComplaintDetailToEntity, mapComplaintToEntity } from './mapper';
import { ComplaintsRepository } from './repository';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly complaintsRepository: ComplaintsRepository,
    private readonly historyService: HistoryService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  async createComplaint(
    dto: CreateComplaintDto,
    submittedById?: string,
  ): Promise<{
    complaintId: string;
    complaintNumber: string;
    status: Status;
    priorityLevel: number;
    submittedAt: Date;
    timerExpiresAt: Date;
    trackingToken?: string;
  }> {
    const submittedAt = new Date();
    const timerExpiresAt = new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000);

    // Allocate the sequence number on its own connection/statement, OUTSIDE the
    // create transaction, so the counter row lock is held for microseconds
    // instead of for the whole complaint-creation transaction. A number is
    // burned (never reclaimed) if the subsequent insert fails — standard
    // practice for high-concurrency counters.
    const complaintNumber = await this.generateComplaintNumber();
    const trackingToken = submittedById ? undefined : randomBytes(32).toString('hex');

    return this.prisma.$transaction(async (tx) => {
      const complaint = await this.complaintsRepository.create(
        {
          complaintNumber,
          roomNo: dto.roomNo,
          block: dto.block,
          rank: dto.rank,
          category: dto.category,
          contactMethod: dto.contactMethod,
          contactNumber: dto.contactNumber,
          description: dto.description,
          status: Status.NEW,
          submittedAt,
          timerExpiresAt,
          priorityLevel: dto.rank,
          ...(trackingToken ? { trackingToken } : {}),
          ...(submittedById ? { submittedBy: { connect: { id: submittedById } } } : {}),
        },
        tx,
      );

      await this.historyService.createHistoryEntry(
        {
          complaintId: complaint.id,
          status: complaint.status as Status,
          handledById: null,
          comment: 'Complaint created.',
        },
        tx,
      );

      await this.notificationsService.createNotification(
        {
          complaintId: complaint.id,
          recipientType: 'IT_STAFF',
          message: `Complaint ${complaint.complaintNumber} has been submitted.`,
        },
        tx,
      );

      return {
        complaintId: complaint.id,
        complaintNumber: complaint.complaintNumber,
        status: complaint.status as Status,
        priorityLevel: complaint.priorityLevel,
        submittedAt: complaint.submittedAt,
        timerExpiresAt: complaint.timerExpiresAt as Date,
        ...(trackingToken ? { trackingToken } : {}),
      };
    });
  }

  async getGuestTracking(trackingToken: string): Promise<{
    status: Status;
    technicianName: string | null;
  }> {
    const tracking = await this.complaintsRepository.findGuestTrackingByToken(trackingToken);
    if (!tracking) {
      throw new NotFoundException('Guest tracking record not found.');
    }
    return tracking;
  }

  async getComplaints(query: QueryComplaintsDto): Promise<{
    data: ComplaintEntity[];
    pagination: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
    };
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ComplaintWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priorityLevel = query.priority;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { complaintNumber: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { roomNo: { contains: query.search, mode: 'insensitive' } },
        { block: { contains: query.search, mode: 'insensitive' } },
        { contactNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.date) {
      const day = new Date(query.date);
      const start = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()));
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      where.submittedAt = {
        gte: start,
        lt: end,
      };
    }

    const [records, totalRecords] = await Promise.all([
      this.complaintsRepository.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ priorityLevel: 'desc' }, { submittedAt: 'asc' }],
      }),
      this.complaintsRepository.count(where),
    ]);

    return {
      data: records.map((record) =>
        mapComplaintToEntity(record as unknown as Parameters<typeof mapComplaintToEntity>[0]),
      ),
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: totalRecords === 0 ? 0 : Math.ceil(totalRecords / limit),
      },
    };
  }

  async getComplaintById(id: string): Promise<ComplaintDetailEntity> {
    const complaint = await this.complaintsRepository.findById(id);
    if (!complaint) {
      throw new NotFoundException('Complaint not found.');
    }

    return mapComplaintDetailToEntity(
      complaint as unknown as Parameters<typeof mapComplaintDetailToEntity>[0],
    );
  }

  async getMyComplaints(
    userId: string,
    query: QueryComplaintsDto,
  ): Promise<{
    data: ComplaintEntity[];
    pagination: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
    };
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ComplaintWhereInput = { submittedById: userId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priorityLevel = query.priority;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { complaintNumber: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { roomNo: { contains: query.search, mode: 'insensitive' } },
        { block: { contains: query.search, mode: 'insensitive' } },
        { contactNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [records, totalRecords] = await Promise.all([
      this.complaintsRepository.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ priorityLevel: 'desc' }, { submittedAt: 'asc' }],
      }),
      this.complaintsRepository.count(where),
    ]);

    return {
      data: records.map((record) =>
        mapComplaintToEntity(record as unknown as Parameters<typeof mapComplaintToEntity>[0]),
      ),
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: totalRecords === 0 ? 0 : Math.ceil(totalRecords / limit),
      },
    };
  }

  async getMyComplaintById(id: string, userId: string): Promise<ComplaintDetailEntity> {
    const complaint = await this.complaintsRepository.findMineById(id, userId);
    if (!complaint) {
      throw new NotFoundException('Complaint not found.');
    }

    return mapComplaintDetailToEntity(
      complaint as unknown as Parameters<typeof mapComplaintDetailToEntity>[0],
    );
  }

  async updateComplaintStatus(
    id: string,
    dto: UpdateStatusDto,
    actorId: string,
  ): Promise<ComplaintEntity> {
    const complaint = await this.complaintsRepository.findById(id);
    if (!complaint) {
      throw new NotFoundException('Complaint not found.');
    }

    const currentStatus = complaint.status as Status;
    if (!this.isTransitionAllowed(currentStatus, dto.status)) {
      throw new UnprocessableEntityException('Illegal status transition.');
    }

    const comment = dto.comment?.trim() || this.getStatusComment(dto.status);

    const updatedComplaint = await this.prisma.$transaction(async (tx) => {
      // Optimistic concurrency: only transition from the observed current status.
      const result = await this.complaintsRepository.updateStatusWithTransaction(
        id,
        currentStatus,
        dto.status,
        tx,
      );

      if (result.count === 0) {
        throw new ConflictException(
          'Complaint status has changed concurrently. Please refresh and retry.',
        );
      }

      await this.historyService.createHistoryEntry(
        {
          complaintId: id,
          status: dto.status,
          handledById: actorId,
          comment,
        },
        tx,
      );

      await this.notificationsService.createNotification(
        {
          complaintId: id,
          recipientType: this.getNotificationRecipient(dto.status),
          message: this.getNotificationMessage(
            complaint.complaintNumber,
            dto.status,
          ),
        },
        tx,
      );

      const updated = await this.complaintsRepository.findByIdWithTransaction(id, tx);
      return updated;
    });

    return mapComplaintToEntity(
      updatedComplaint as unknown as Parameters<typeof mapComplaintToEntity>[0],
    );
  }

  private isTransitionAllowed(currentStatus: Status, nextStatus: Status): boolean {
    const allowedTransitions: Record<Status, Status[]> = {
      NEW: [Status.ACKNOWLEDGED, Status.ESCALATED],
      ACKNOWLEDGED: [Status.IN_PROGRESS, Status.ESCALATED],
      IN_PROGRESS: [Status.RESOLVED, Status.ESCALATED],
      ESCALATED: [Status.IN_PROGRESS, Status.RESOLVED],
      RESOLVED: [Status.CLOSED],
      CLOSED: [],
    };

    return allowedTransitions[currentStatus]?.includes(nextStatus) ?? false;
  }

  private getStatusComment(status: Status): string {
    const comments: Record<Status, string> = {
      NEW: 'Complaint created.',
      ACKNOWLEDGED: 'Complaint acknowledged.',
      IN_PROGRESS: 'Complaint moved to in progress.',
      ESCALATED: 'Complaint escalated.',
      RESOLVED: 'Complaint resolved.',
      CLOSED: 'Complaint closed.',
    };

    return comments[status];
  }

  private getNotificationRecipient(status: Status): string {
    return status === Status.ESCALATED ? 'IT_STAFF' : 'COMPLAINANT';
  }

  private getNotificationMessage(complaintNumber: string, status: Status): string {
    const messages: Record<Status, string> = {
      NEW: `Complaint ${complaintNumber} is now new.`,
      ACKNOWLEDGED: `Complaint ${complaintNumber} has been acknowledged.`,
      IN_PROGRESS: `Complaint ${complaintNumber} is now in progress.`,
      ESCALATED: `Complaint ${complaintNumber} has been escalated.`,
      RESOLVED: `Complaint ${complaintNumber} has been resolved.`,
      CLOSED: `Complaint ${complaintNumber} has been closed.`,
    };

    return messages[status];
  }

  private async generateComplaintNumber(): Promise<string> {
    const currentYear = new Date().getUTCFullYear();
    const name = `complaint-${currentYear}`;
    // Single atomic statement: bootstrap the per-year row if missing, otherwise
    // increment it. Runs outside the create transaction (autocommit), so the
    // counter row lock is held only for this statement — microseconds — instead
    // of for the whole complaint-creation transaction.
    const rows = await this.prisma.$queryRaw<Array<{ current: number }>>`
      INSERT INTO "sequence_counters" ("id", "name", "current", "updatedAt")
      VALUES (${randomUUID()}, ${name}, 1, now())
      ON CONFLICT ("name")
      DO UPDATE SET "current" = "sequence_counters"."current" + 1, "updatedAt" = now()
      RETURNING "current"
    `;
    const current = rows[0]?.current;
    if (!current) {
      throw new Error(`Failed to allocate complaint number for ${name}`);
    }
    return `CMP-${currentYear}-${String(current).padStart(4, '0')}`;
  }
}

import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Status } from '@prisma/client';
import { PrismaService } from '../database/service';
import { HistoryService } from '../history/service';
import { NotificationsService } from '../notifications/service';
import { UsersRepository } from '../users/repository';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { AssignmentEntity } from './entities/assignment.entity';
import { AssignmentRepository } from './repository';

@Injectable()
export class AssignmentService {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly historyService: HistoryService,
    private readonly notificationsService: NotificationsService,
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async assignTechnician(complaintId: string, dto: AssignTechnicianDto, actorId: string): Promise<AssignmentEntity> {
    const complaint = await this.assignmentRepository.findById(complaintId);
    if (!complaint) {
      throw new NotFoundException('Complaint not found.');
    }

    if (complaint.status !== Status.NEW) {
      throw new UnprocessableEntityException('Only new complaints can be dispatched.');
    }

    const actor = await this.usersRepository.findById(actorId);
    const acknowledgedAt = new Date();
    const responseTimeSeconds = Math.max(
      0,
      Math.floor((acknowledgedAt.getTime() - complaint.submittedAt.getTime()) / 1000),
    );

    const assignment = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.complaint.updateMany({
        where: {
          id: complaintId,
          assignedToId: null,
          status: Status.NEW,
        },
        data: {
          assignedToId: actorId,
          technicianName: dto.technicianName,
          dispatchTime: acknowledgedAt,
          responseTimeSeconds,
          status: Status.ACKNOWLEDGED,
          updatedAt: new Date(),
        },
      });

      if (updated.count === 0) {
        throw new ConflictException('Complaint is already assigned.');
      }

      await this.historyService.createHistoryEntry(
        {
          complaintId,
          status: Status.ACKNOWLEDGED,
          handledById: actorId,
          comment:
            dto.comment?.trim() ||
            `Assigned to ${dto.technicianName}.`,
        },
        tx,
      );

      await this.notificationsService.createNotification(
        {
          complaintId,
          recipientType: 'COMPLAINANT',
          message: `${dto.technicianName} is coming to solve your ${this.getCategoryLabel(complaint.category)} complaint.`,
        },
        tx,
      );

      return {
        complaintId,
        technicianName: dto.technicianName,
        dispatchTime: acknowledgedAt,
        handledBy: {
          id: actorId,
          fullName: actor?.fullName ?? 'Assigned handler',
        },
        status: Status.ACKNOWLEDGED,
      };
    });

    return assignment;
  }

  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      SOFTWARE_HARDWARE: 'software/hardware',
      INTERNET: 'internet',
      E_OFFICE: 'E-Office',
      OTHER: 'other IT issue',
    };
    return labels[category] ?? 'IT issue';
  }
}

import { Complaint } from '@prisma/client';
import { QueueItemEntity } from './entities/queue-item.entity';

export function mapComplaintToQueueItem(c: Complaint): QueueItemEntity {
  return {
    id: c.id,
    complaintNumber: c.complaintNumber,
    roomNo: c.roomNo,
    block: c.block,
    rank: c.rank,
    category: c.category,
    contactMethod: c.contactMethod,
    contactNumber: c.contactNumber,
    description: c.description,
    status: c.status,
    submittedAt: c.submittedAt,
    priorityLevel: c.priorityLevel,
    technicianName: c.technicianName,
    dispatchTime: c.dispatchTime,
    responseTimeSeconds: c.responseTimeSeconds,
    assignedToId: c.assignedToId,
    timerExpiresAt: c.timerExpiresAt,
  };
}

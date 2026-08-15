import { Controller, Get, Param } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { HistoryService } from './service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Roles(Role.IT_STAFF, Role.ADMIN)
  @Get('complaints/:complaintId')
  async getComplaintHistory(@Param('complaintId') complaintId: string): Promise<unknown> {
    const history = await this.historyService.getComplaintHistory(complaintId);
    return {
      success: true,
      message: 'Complaint history retrieved successfully.',
      data: history,
    };
  }

  @Roles(Role.IT_STAFF, Role.ADMIN)
  @Get('assignments/:complaintId')
  async getAssignmentHistory(@Param('complaintId') complaintId: string): Promise<unknown> {
    const history = await this.historyService.getComplaintHistory(complaintId);
    return {
      success: true,
      message: 'Assignment history retrieved successfully.',
      data: history,
    };
  }
}

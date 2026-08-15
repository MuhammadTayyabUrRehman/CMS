import { Body, Controller, Param, Patch } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/types/session';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { AssignmentService } from './service';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Roles(Role.IT_STAFF, Role.ADMIN)
  @Patch(':complaintId')
  async assignTechnician(
    @Param('complaintId') complaintId: string,
    @Body() dto: AssignTechnicianDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<unknown> {
    const assignment = await this.assignmentService.assignTechnician(complaintId, dto, user.id);
    return {
      success: true,
      message: 'Complaint assigned successfully.',
      data: assignment,
    };
  }
}

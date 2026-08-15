import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/types/session';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { QueryComplaintsDto } from './dto/query-complaints.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ComplaintsService } from './service';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Public()
  @Post()
  async createComplaint(
    @Body() dto: CreateComplaintDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<unknown> {
    const result = await this.complaintsService.createComplaint(dto, user?.id);
    return {
      success: true,
      message: 'Complaint submitted successfully.',
      data: result,
    };
  }

  @Roles(Role.USER)
  @Get('mine')
  async listMyComplaints(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryComplaintsDto,
  ): Promise<unknown> {
    const result = await this.complaintsService.getMyComplaints(user.id, query);
    return {
      success: true,
      message: 'Complaints retrieved successfully.',
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Public()
  @Get('guest-tracking/:token')
  async getGuestTracking(@Param('token') token: string): Promise<unknown> {
    const tracking = await this.complaintsService.getGuestTracking(token);
    return {
      success: true,
      message: 'Guest complaint tracking retrieved successfully.',
      data: tracking,
    };
  }

  @Roles(Role.USER)
  @Get('mine/:id')
  async getMyComplaint(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<unknown> {
    const complaint = await this.complaintsService.getMyComplaintById(id, user.id);
    return {
      success: true,
      message: 'Complaint retrieved successfully.',
      data: complaint,
    };
  }

  @Roles(Role.IT_STAFF, Role.ADMIN)
  @Get()
  async listComplaints(@Query() query: QueryComplaintsDto): Promise<unknown> {
    const result = await this.complaintsService.getComplaints(query);
    return {
      success: true,
      message: 'Complaints retrieved successfully.',
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Roles(Role.IT_STAFF, Role.ADMIN)
  @Get(':id')
  async getComplaint(@Param('id') id: string): Promise<unknown> {
    const complaint = await this.complaintsService.getComplaintById(id);
    return {
      success: true,
      message: 'Complaint retrieved successfully.',
      data: complaint,
    };
  }

  @Roles(Role.IT_STAFF, Role.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<unknown> {
    const complaint = await this.complaintsService.updateComplaintStatus(id, dto, user.id);
    return {
      success: true,
      message: 'Complaint status updated successfully.',
      data: complaint,
    };
  }
}

import { Controller, Get, NotFoundException, Param, Patch } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/session';
import { NotificationsService } from './service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(Role.IT_STAFF, Role.ADMIN)
  @Get()
  async listNotifications(): Promise<unknown> {
    const notifications = await this.notificationsService.listNotifications('IT_STAFF');
    return {
      success: true,
      message: 'Notifications retrieved successfully.',
      data: notifications,
    };
  }

  @Roles(Role.USER)
  @Get('mine')
  async listMyNotifications(@CurrentUser() user: AuthenticatedUser): Promise<unknown> {
    const notifications = await this.notificationsService.listUnreadForComplainant(user.id);
    return {
      success: true,
      message: 'Unread notifications retrieved successfully.',
      data: notifications,
    };
  }

  @Roles(Role.USER)
  @Patch('mine/:id/read')
  async markMineAsRead(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<unknown> {
    const notification = await this.notificationsService.markComplainantAsRead(id, user.id);
    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }
    return {
      success: true,
      message: 'Notification marked as read.',
      data: notification,
    };
  }

  @Roles(Role.IT_STAFF, Role.ADMIN)
  @Get('vvip-alerts')
  async listVvipAlerts(): Promise<unknown> {
    const notifications = await this.notificationsService.listUnreadVvipAlerts();
    return {
      success: true,
      message: 'Unread VVIP alerts retrieved successfully.',
      data: notifications,
    };
  }

  @Roles(Role.IT_STAFF, Role.ADMIN)
  @Patch('vvip-alerts/:id/read')
  async markVvipAlertAsRead(@Param('id') id: string): Promise<unknown> {
    const notification = await this.notificationsService.markVvipAlertAsRead(id);
    if (!notification) throw new NotFoundException('Unread VVIP alert not found.');
    return { success: true, message: 'VVIP alert marked as read.', data: notification };
  }

  @Roles(Role.IT_STAFF, Role.ADMIN)
  @Get('complaints/:complaintId')
  async getComplaintNotifications(@Param('complaintId') complaintId: string): Promise<unknown> {
    const notifications = await this.notificationsService.getNotificationsForComplaint(complaintId);
    return {
      success: true,
      message: 'Notifications retrieved successfully.',
      data: notifications,
    };
  }

  @Roles(Role.IT_STAFF, Role.ADMIN)
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<unknown> {
    const notification = await this.notificationsService.markAsRead(id);
    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }
    return {
      success: true,
      message: 'Notification marked as read.',
      data: notification,
    };
  }
}

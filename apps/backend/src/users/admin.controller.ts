import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateItStaffDto, QueryUsersDto } from './dto/admin.dto';
import { UserActivityEntity } from './entities/activity.entity';
import { UsersService } from './service';

@ApiTags('Admin Users')
@Roles(Role.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users (optionally filtered by role)' })
  async listUsers(@Query() query: QueryUsersDto) {
    const data = await this.usersService.listUsers(query.role);
    return { success: true, message: 'Users retrieved successfully.', data };
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get complaint activity for a single user' })
  async getUserActivity(@Param('id') id: string): Promise<UserActivityEntity> {
    return this.usersService.getUserActivity(id);
  }

  @Post('it-staff')
  @ApiOperation({ summary: 'Create a new IT staff member (admin-managed)' })
  async createItStaff(@Body() dto: CreateItStaffDto) {
    const data = await this.usersService.createItStaff(dto);
    return { success: true, message: 'IT staff member created successfully.', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a non-admin user' })
  async deleteUser(@Param('id') id: string) {
    const data = await this.usersService.deleteUser(id);
    return { success: true, message: 'User deleted successfully.', data };
  }

  // ---------------------------------------------------------------------------
  // DISABLED PLACEHOLDER — "Assign additional admins" (backlog item E)
  // Not implemented yet. Exists only so the frontend route can be surfaced and
  // to mark the intended location of the future admin-grant endpoint.
  // ---------------------------------------------------------------------------
  @Post('assign-admin')
  @ApiOperation({ summary: '[Disabled] Assign an additional admin role to a user' })
  async assignAdmin() {
    return {
      success: false,
      message: 'This feature is not yet available.',
      data: null,
    };
  }
}

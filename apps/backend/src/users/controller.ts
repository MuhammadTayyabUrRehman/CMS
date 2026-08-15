import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/types/session';
import { UsersService } from './service';
import { UserResponseDto } from './dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: "Get the current authenticated user's profile" })
  getCurrentProfile(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: "Update the current user's own profile (fullName, phone)" })
  async updateCurrentProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const data = await this.usersService.updateProfile(user.id, dto);
    return { success: true, message: 'Profile updated successfully.', data };
  }

  @Get('it-staff')
  @Roles(Role.ADMIN, Role.IT_STAFF)
  @ApiOperation({ summary: 'List all IT staff members' })
  listItStaff(): Promise<UserResponseDto[]> {
    return this.usersService.listItStaff();
  }

  @Get('it-staff/:id')
  @Roles(Role.ADMIN, Role.IT_STAFF)
  @ApiOperation({ summary: 'Find an IT staff member by id' })
  findItStaffById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findItStaffById(id);
  }
}

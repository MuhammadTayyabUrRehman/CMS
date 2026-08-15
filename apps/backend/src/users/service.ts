import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, Status } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './repository';
import { UserResponseDto } from './dto';
import { CreateItStaffDto } from './dto/admin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserActivityEntity } from './entities/activity.entity';
import { toUserResponseDto } from './mapper';

const ALL_STATUSES: Status[] = ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return toUserResponseDto(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const data: { fullName?: string; phone?: string | null } = {};
    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName;
    }
    if (dto.phone !== undefined) {
      // Allow the phone number to be cleared by sending an empty string.
      data.phone = dto.phone.trim() === '' ? null : dto.phone;
    }

    const updated = await this.usersRepository.update(userId, data);
    return toUserResponseDto(updated);
  }

  async listItStaff(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findManyByRole(Role.IT_STAFF);
    return users.map(toUserResponseDto);
  }

  async findItStaffById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user || user.role !== Role.IT_STAFF) {
      throw new NotFoundException('IT staff member not found.');
    }
    return toUserResponseDto(user);
  }

  async listUsers(role?: Role): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findMany(role ? { role } : undefined);
    return users.map(toUserResponseDto);
  }

  async getUserActivity(id: string): Promise<UserActivityEntity> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const [assignedByStatus, submittedByStatus, assignedCount, submittedCount, recent] =
      await Promise.all([
        this.usersRepository.countByStatusForUser(id, 'assignedTo'),
        this.usersRepository.countByStatusForUser(id, 'submittedBy'),
        this.usersRepository.countComplaintsForUser(id, 'assignedTo'),
        this.usersRepository.countComplaintsForUser(id, 'submittedBy'),
        this.usersRepository.findRecentComplaintsForUser(id),
      ]);

    const countsByStatus = {} as Record<Status, number>;
    ALL_STATUSES.forEach((s) => {
      countsByStatus[s] = 0;
    });
    [...assignedByStatus, ...submittedByStatus].forEach((row) => {
      countsByStatus[row.status] += row._count.id;
    });

    return {
      id: user.id,
      fullName: user.fullName,
      employeeId: user.employeeId,
      role: user.role,
      countsByStatus,
      assignedComplaints: assignedCount,
      submittedComplaints: submittedCount,
      recentComplaints: recent.map((c) => ({
        id: c.id,
        complaintNumber: c.complaintNumber,
        category: c.category as UserActivityEntity['recentComplaints'][number]['category'],
        status: c.status as Status,
        submittedAt: c.submittedAt,
        role: c.assignedToId === user.id ? 'ASSIGNED' : 'SUBMITTED',
      })),
    };
  }

  async createItStaff(dto: CreateItStaffDto): Promise<UserResponseDto> {
    const [emailExists, employeeIdExists] = await Promise.all([
      this.usersRepository.findByEmail(dto.email),
      this.usersRepository.findByEmployeeId(dto.employeeId),
    ]);
    if (emailExists) {
      throw new ConflictException('An account with this email already exists.');
    }
    if (employeeIdExists) {
      throw new ConflictException('This Employee ID is already registered.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.usersRepository.create({
      fullName: dto.fullName,
      employeeId: dto.employeeId,
      department: dto.department,
      email: dto.email,
      phone: dto.phone ?? null,
      role: Role.IT_STAFF,
      password: hashedPassword,
    });
    return toUserResponseDto(user);
  }

  async deleteUser(id: string): Promise<{ id: string }> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Admin accounts cannot be deleted.');
    }
    try {
      await this.usersRepository.delete(id);
    } catch {
      throw new BadRequestException(
        'This user has records linked to complaints and cannot be deleted.',
      );
    }
    return { id };
  }
}

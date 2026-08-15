import { ApiProperty } from '@nestjs/swagger';
import { Department, Role } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  employeeId!: string;

  @ApiProperty({ enum: Department })
  department!: Department;

  @ApiProperty()
  email!: string;

  @ApiProperty({ required: false, nullable: true })
  phone!: string | null;

  @ApiProperty({ enum: Role })
  role!: Role;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

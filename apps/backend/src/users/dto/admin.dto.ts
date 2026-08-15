import { ApiProperty } from '@nestjs/swagger';
import { Department, Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export { Department };

export class QueryUsersDto {
  @ApiProperty({ enum: Role, required: false })
  @IsOptional()
  @IsEnum(Role, { message: 'role must be a valid role' })
  role?: Role;
}

export class CreateItStaffDto {
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  fullName: string;

  @IsNotEmpty({ message: 'Employee ID is required' })
  @IsString()
  employeeId: string;

  @IsNotEmpty({ message: 'Department is required' })
  @IsEnum(Department, { message: 'Please select a valid department' })
  department: Department;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Password must contain at least one uppercase letter and one number',
  })
  password: string;
}

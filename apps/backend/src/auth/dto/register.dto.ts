// =============================================
// Register DTO
// Defines what data the Register API accepts
// =============================================

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Department } from '@prisma/client';
import { IsPasswordPolicy } from './password-policy.decorator';

export { Department };

export class RegisterDto {
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

  @IsNotEmpty({ message: 'Password is required' })
  @IsPasswordPolicy()
  password: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  confirmPassword: string;
}

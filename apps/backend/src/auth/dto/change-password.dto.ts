// =============================================
// Change Password DTO
// Defines what data the Change Password API accepts
// =============================================

import { IsNotEmpty, IsString } from 'class-validator';
import { IsPasswordPolicy } from './password-policy.decorator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  currentPassword: string;

  @IsNotEmpty({ message: 'New password is required' })
  @IsPasswordPolicy()
  newPassword: string;

  @IsNotEmpty({ message: 'Confirm new password is required' })
  @IsString()
  confirmNewPassword: string;
}

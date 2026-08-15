// =============================================
// Reset Password DTO
// =============================================

import { IsNotEmpty, IsString } from 'class-validator';
import { IsPasswordPolicy } from './password-policy.decorator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Reset token is required' })
  @IsString()
  token: string;

  @IsNotEmpty({ message: 'New password is required' })
  @IsPasswordPolicy()
  newPassword: string;
}

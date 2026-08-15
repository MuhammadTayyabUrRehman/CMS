import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// Self-service profile update. Only safe-to-self-edit fields are whitelisted:
// fullName and phone. email, employeeId, role, department and isActive are
// deliberately NOT present — the global ValidationPipe (whitelist +
// forbidNonWhitelisted) rejects any attempt to send them, so they can never
// be silently applied.
export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'Full name cannot be empty' })
  @IsString()
  @MaxLength(150, { message: 'Full name must be at most 150 characters' })
  fullName?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(25, { message: 'Phone must be at most 25 characters' })
  phone?: string;
}

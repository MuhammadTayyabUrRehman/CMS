import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(Status, { message: 'Status is invalid.' })
  @IsNotEmpty({ message: 'Status is required.' })
  status!: Status;

  @IsOptional()
  @IsString({ message: 'Comment must be a string.' })
  @MaxLength(2000, { message: 'Comment must be at most 2000 characters.' })
  comment?: string;
}

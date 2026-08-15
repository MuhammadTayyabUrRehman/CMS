import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AssignTechnicianDto {
  @IsString({ message: 'Technician name is required.' })
  @IsNotEmpty({ message: 'Technician name is required.' })
  @MaxLength(150, { message: 'Technician name must be at most 150 characters.' })
  technicianName!: string;

  @IsOptional()
  @IsString({ message: 'Comment must be a string.' })
  @MaxLength(2000, { message: 'Comment must be at most 2000 characters.' })
  comment?: string;
}

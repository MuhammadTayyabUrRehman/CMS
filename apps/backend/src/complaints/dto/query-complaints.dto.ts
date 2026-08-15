import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Category, Status } from '@prisma/client';

export class QueryComplaintsDto {
  @IsOptional()
  @IsEnum(Status, { message: 'Status is invalid.' })
  status?: Status;

  @IsOptional()
  @IsInt({ message: 'Priority must be an integer.' })
  @Min(1, { message: 'Priority must be greater than 0.' })
  @Type(() => Number)
  priority?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Date must be a valid ISO date string.' })
  date?: string;

  @IsOptional()
  @IsEnum(Category, { message: 'Category is invalid.' })
  category?: Category;

  @IsOptional()
  @IsString({ message: 'Search must be a string.' })
  search?: string;

  @IsOptional()
  @IsInt({ message: 'Page must be an integer.' })
  @Min(1, { message: 'Page must be at least 1.' })
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt({ message: 'Limit must be an integer.' })
  @Min(1, { message: 'Limit must be at least 1.' })
  @Max(100, { message: 'Limit must be at most 100.' })
  @Type(() => Number)
  limit?: number = 20;
}

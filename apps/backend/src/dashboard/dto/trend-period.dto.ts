import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum TrendPeriod {
  DAILY = 'daily',
  LAST_7_DAYS = 'last7days',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class TrendPeriodDto {
  @ApiProperty({ enum: TrendPeriod, default: TrendPeriod.LAST_7_DAYS, required: false })
  @IsOptional()
  @IsEnum(TrendPeriod, { message: 'period must be one of daily, last7days, weekly, monthly, yearly' })
  period?: TrendPeriod;
}

import { Module } from '@nestjs/common';
import { DashboardService } from './service';
import { DashboardController } from './controller';
import { DashboardRepository } from './repository';

@Module({
  imports: [],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
  exports: [DashboardService],
})
export class DashboardModule {}


import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './service';
import { SchedulerController } from './controller';
import { SchedulerRepository } from './repository';
import { ComplaintsModule } from '../complaints/module';

@Module({
  imports: [ScheduleModule.forRoot(), ComplaintsModule],
  controllers: [SchedulerController],
  providers: [SchedulerService, SchedulerRepository],
  exports: [SchedulerService],
})
export class SchedulerModule {}

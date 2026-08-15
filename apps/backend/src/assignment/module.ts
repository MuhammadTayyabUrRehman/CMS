import { Module } from '@nestjs/common';
import { HistoryModule } from '../history/module';
import { NotificationsModule } from '../notifications/module';
import { UsersModule } from '../users/module';
import { AssignmentController } from './controller';
import { AssignmentRepository } from './repository';
import { AssignmentService } from './service';

@Module({
  imports: [HistoryModule, NotificationsModule, UsersModule],
  controllers: [AssignmentController],
  providers: [AssignmentService, AssignmentRepository],
  exports: [AssignmentService],
})
export class AssignmentModule {}

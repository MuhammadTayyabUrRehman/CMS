import { Module } from '@nestjs/common';
import { HistoryModule } from '../history/module';
import { NotificationsModule } from '../notifications/module';
import { ComplaintsController } from './controller';
import { ComplaintsRepository } from './repository';
import { ComplaintsService } from './service';

@Module({
  imports: [HistoryModule, NotificationsModule],
  controllers: [ComplaintsController],
  providers: [ComplaintsService, ComplaintsRepository],
  exports: [ComplaintsService, ComplaintsRepository],
})
export class ComplaintsModule {}

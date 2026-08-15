import { Module } from '@nestjs/common';
import { NotificationsController } from './controller';
import { NotificationsRepository } from './repository';
import { NotificationsService } from './service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}

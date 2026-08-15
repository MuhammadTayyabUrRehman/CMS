import { Module } from '@nestjs/common';
import { QueueService } from './service';
import { QueueController } from './controller';
import { QueueRepository } from './repository';

@Module({
  imports: [],
  controllers: [QueueController],
  providers: [QueueService, QueueRepository],
  exports: [QueueService],
})
export class QueueModule {}


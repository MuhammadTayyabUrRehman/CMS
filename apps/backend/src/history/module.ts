import { Module } from '@nestjs/common';
import { HistoryController } from './controller';
import { HistoryRepository } from './repository';
import { HistoryService } from './service';

@Module({
  controllers: [HistoryController],
  providers: [HistoryService, HistoryRepository],
  exports: [HistoryService, HistoryRepository],
})
export class HistoryModule {}

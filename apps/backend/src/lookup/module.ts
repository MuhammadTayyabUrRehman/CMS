import { Module } from '@nestjs/common';
import { LookupController } from './controller';
import { LookupService } from './service';

@Module({
  controllers: [LookupController],
  providers: [LookupService],
})
export class LookupModule {}

// Scaffold module for shared
import { Module } from '@nestjs/common';
import { SharedController } from './controller';
import { SharedService } from './service';

@Module({
  imports: [],
  controllers: [SharedController],
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {}

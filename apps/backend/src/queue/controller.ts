import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { QueueService } from './service';
import { QueryQueueDto } from './dto/query-queue.dto';

@Controller('employee/queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Roles(Role.IT_STAFF, Role.ADMIN)
  @Get()
  async getQueue(@Query() query: QueryQueueDto) {
    const result = await this.queueService.getQueue(query);
    return {
      success: true,
      message: 'Queue retrieved successfully.',
      data: result.data,
      pagination: result.pagination,
    };
  }
}


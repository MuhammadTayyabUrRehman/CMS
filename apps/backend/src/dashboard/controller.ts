import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DashboardService } from './service';
import { TrendPeriodDto, TrendPeriod } from './dto/trend-period.dto';

@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(Role.ADMIN)
  @Get()
  async getSummary() {
    const data = await this.dashboardService.getSummary();
    return {
      success: true,
      message: 'Dashboard summary retrieved successfully.',
      data,
    };
  }

  @Roles(Role.ADMIN)
  @Get('trends')
  async getTrends(@Query() query: TrendPeriodDto) {
    const period = query.period ?? TrendPeriod.LAST_7_DAYS;
    const data = await this.dashboardService.getTrends(period);
    return {
      success: true,
      message: 'Complaint trends retrieved successfully.',
      data,
    };
  }

  @Roles(Role.ADMIN)
  @Get('new-acknowledged')
  async getNewAcknowledgedTrend(@Query() query: TrendPeriodDto) {
    const period = query.period ?? TrendPeriod.LAST_7_DAYS;
    const data = await this.dashboardService.getNewAcknowledgedTrend(period);
    return {
      success: true,
      message: 'New vs acknowledged trend retrieved successfully.',
      data,
    };
  }

  @Roles(Role.ADMIN)
  @Get('staff')
  async getStaffPerformance() {
    const data = await this.dashboardService.getStaffPerformance();
    return {
      success: true,
      message: 'Staff performance retrieved successfully.',
      data,
    };
  }
}

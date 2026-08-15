import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppConfigService } from '../config/service';

function withPoolParams(url: string, poolSize: number, poolTimeout: number): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}connection_limit=${poolSize}&pool_timeout=${poolTimeout}`;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: AppConfigService) {
    super({
      datasources: {
        db: {
          url: withPoolParams(
            configService.databaseUrl,
            configService.databasePoolSize,
            configService.databasePoolTimeout,
          ),
        },
      },
      log: configService.isProduction
        ? ['warn', 'error']
        : ['warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected to database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database');
  }
}

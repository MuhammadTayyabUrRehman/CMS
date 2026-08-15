import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../database/service';
import { AppConfigService } from '../config/service';

export interface HealthStatus {
  status: 'UP' | 'DOWN';
  application: string;
  version: string;
  environment: string;
  timestamp: string;
  database: {
    status: 'CONNECTED' | 'DISCONNECTED';
    latencyMs?: number;
  };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: AppConfigService,
  ) {}

  async check(): Promise<HealthStatus> {
    const database = await this.checkDatabase();

    return {
      status: database.status === 'CONNECTED' ? 'UP' : 'DOWN',
      application: this.configService.appName,
      version: this.readVersion(),
      environment: this.configService.nodeEnv,
      timestamp: new Date().toISOString(),
      database,
    };
  }

  private readVersion(): string {
    try {
      const pkgPath = path.join(process.cwd(), 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version?: string };
      return pkg.version || '0.0.1';
    } catch {
      return '0.0.1';
    }
  }

  private async checkDatabase(): Promise<HealthStatus['database']> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'CONNECTED', latencyMs: Date.now() - start };
    } catch {
      return { status: 'DISCONNECTED' };
    }
  }
}

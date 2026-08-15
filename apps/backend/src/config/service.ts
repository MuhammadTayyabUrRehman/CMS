import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './configuration';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  get nodeEnv(): string {
    return this.configService.get('nodeEnv', { infer: true });
  }

  get isProduction(): boolean {
    return this.configService.get('isProduction', { infer: true });
  }

  get port(): number {
    return this.configService.get('port', { infer: true });
  }

  get appName(): string {
    return this.configService.get('appName', { infer: true });
  }

  get databaseUrl(): string {
    return this.configService.get('database', { infer: true }).url;
  }

  get databasePoolSize(): number {
    return this.configService.get('database', { infer: true }).poolSize;
  }

  get databasePoolTimeout(): number {
    return this.configService.get('database', { infer: true }).poolTimeout;
  }

  get jwtSecret(): string {
    return this.configService.get('jwt', { infer: true }).secret;
  }

  get jwtExpiresIn(): string {
    return this.configService.get('jwt', { infer: true }).expiresIn;
  }

  get frontendUrl(): string {
    return this.configService.get('frontendUrl', { infer: true });
  }

  get mail(): { user: string; password: string; from: string } {
    return this.configService.get('mail', { infer: true });
  }
}

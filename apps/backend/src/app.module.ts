// =============================================
// Root Application Module — MERGED
// Your Auth Team + Other Backend Team
// =============================================

import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// ── YOUR TEAM'S MODULES ──────────────────────
import { AuthModule }   from './auth/auth.module';
import { MailModule }   from './mail/mail.module';

import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// ── OTHER TEAM'S MODULES ─────────────────────
import { AssignmentModule }    from './assignment/module';
import { CommonModule }        from './common/module';
import { ComplaintsModule }    from './complaints/module';
import { ConfigModule }     from './config/module';
import { DashboardModule }     from './dashboard/module';
import { DatabaseModule }      from './database/module';
import { HealthModule }        from './health/module';
import { HistoryModule }       from './history/module';
import { LookupModule }        from './lookup/module';
import { NotificationsModule } from './notifications/module';
import { QueueModule }         from './queue/module';
import { SharedModule }        from './shared/module';
import { UsersModule }         from './users/module';

@Module({
  imports: [
    // ConfigModule is @Global() and owns ConfigModule.forRoot()
    ConfigModule,

    // ---- Rate limiting (DoS protection) ----
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '600', 10),
      },
    ]),

    // ── YOUR TEAM ──────────────────────────────
    MailModule,    // Email service
    AuthModule,    // Login, Register, Forgot Password

    // ── OTHER TEAM ─────────────────────────────
    AssignmentModule,     // Complaint assignments
    CommonModule,         // Shared common utilities
    ComplaintsModule,     // Complaint management
    ConfigModule,      // App configuration
    DashboardModule,      // Dashboard data
    DatabaseModule,       // Database utilities
    HealthModule,         // Health check endpoints
    HistoryModule,        // Complaint history
    LookupModule,         // Lookup/dropdown data
    NotificationsModule,  // Notifications
    QueueModule,          // Job queue
    SharedModule,         // Shared resources
    UsersModule,          // User management
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

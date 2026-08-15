// =============================================
// Application Entry Point
// =============================================

import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { AppConfigService } from './config/service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: false,
  });

  const config = app.get(AppConfigService);

  // ---- Global prefix: all routes start with /api ----
  app.setGlobalPrefix('api');

  // ---- Security headers ----
  app.use(helmet());

  // ---- Response compression ----
  app.use(compression());

  // ---- CORS ----
  const allowedOrigins = config.frontendUrl
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ---- Trust proxy so express sees real client IPs behind nginx ----
  app.set('trust proxy', 1);

  // ---- Global validation ----
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      exceptionFactory: (errors) => {
        return new BadRequestException({
          success: false,
          statusCode: 400,
          message: 'Validation failed.',
          errors: errors.map((error) => ({
            field: error.property,
            message: Object.values(error.constraints ?? {}).join(', '),
          })),
        });
      },
    }),
  );

  // ---- Graceful shutdown on SIGTERM/SIGINT ----
  app.enableShutdownHooks();

  // ---- Swagger documentation ----
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ministry of Finance - Complaint Portal API')
    .setDescription('Backend API for the IT Complaint Portal')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.port;
  await app.listen(port, '0.0.0.0');

  logger.log(`Finance Portal Auth Server is running on http://localhost:${port}/api`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();

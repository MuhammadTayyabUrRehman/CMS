import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default(3001),
  APP_NAME: Joi.string().default('IT Complaint Management System'),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  SESSION_SECRET: Joi.string().optional(),
  SESSION_MAX_AGE: Joi.number().default(28800000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  MAIL_USER: Joi.string().allow('').optional(),
  MAIL_PASSWORD: Joi.string().allow('').optional(),
  MAIL_FROM: Joi.string().allow('').optional(),
  DATABASE_POOL_SIZE: Joi.number().default(20),
  DATABASE_POOL_TIMEOUT: Joi.number().default(30),
  THROTTLE_LIMIT: Joi.number().default(600),
  THROTTLE_TTL: Joi.number().default(60000),
});

export interface AppConfig {
  nodeEnv: string;
  port: number;
  appName: string;
  isProduction: boolean;
  database: {
    url: string;
    poolSize: number;
    poolTimeout: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  frontendUrl: string;
  mail: {
    user: string;
    password: string;
    from: string;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  appName: process.env.APP_NAME || 'IT Complaint Management System',
  isProduction: process.env.NODE_ENV === 'production',
  database: {
    url: process.env.DATABASE_URL as string,
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '20', 10),
    poolTimeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '30', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  mail: {
    user: process.env.MAIL_USER || '',
    password: process.env.MAIL_PASSWORD || '',
    from: process.env.MAIL_FROM || 'Finance Division Complaint Portal <no-reply@finance.gov.pk>',
  },
});

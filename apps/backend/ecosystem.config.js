// PM2 process configuration for the Ministry of Finance Complaint Portal backend.
//
// Usage:
//   pm2 start ecosystem.config.js --env production   # production (env_production)
//   pm2 save && pm2 startup   # to restart on boot
//
// Cluster mode scales the worker across all available CPUs so a single box
// comfortably handles the target 50-90 normal / 150-200 peak concurrent users.

module.exports = {
  apps: [
    {
      name: 'complaint-portal-backend',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: '/var/log/pm2/complaint-portal.out.log',
      error_file: '/var/log/pm2/complaint-portal.err.log',
      kill_timeout: 5000,
      listen_timeout: 15000,
    },
  ],
};

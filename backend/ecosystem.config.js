module.exports = {
  apps: [
    {
      name: 'agent-fun-backend',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,

      // Auto restart on crash
      min_uptime: '10s',
      max_restarts: 10,

      // Cron restart (daily at 3 AM)
      cron_restart: '0 3 * * *',

      // Graceful shutdown
      wait_ready: true,

      // Health check
      health_check: {
        enable: true,
        endpoint: '/health',
        interval: 30000, // 30 seconds
        max_fails: 3,
      },
    },
  ],
};

module.exports = {
  apps: [
    {
      name: "mc-notifications",
      script: "./daemon/notifications.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
        CONVEX_URL: process.env.CONVEX_URL,
        CONVEX_ADMIN_KEY: process.env.CONVEX_ADMIN_KEY,
      },
      log_file: "./logs/notifications.log",
      out_file: "./logs/notifications.out.log",
      error_file: "./logs/notifications.error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};

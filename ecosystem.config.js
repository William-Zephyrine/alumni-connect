module.exports = {
  apps: [
    {
      name: "alumni-connect",
      script: "server.js",
      cwd: "/path/to/alumni-connect",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      kill_timeout: 10000,
      listen_timeout: 10000,
      max_memory_restart: "512M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      merge_logs: true,
    },
  ],
};

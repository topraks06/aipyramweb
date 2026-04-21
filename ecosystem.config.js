module.exports = {
  apps: [
    {
      name: 'aipyram-master-brain',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4001',
      instances: 1, // Or 'max' for clustering
      exec_mode: 'fork', // Vercel Next.js loves fork mode for simple VPS
      watch: false, // Prod is not watched
      autorestart: true,
      max_restarts: 100,
      restart_delay: 5000, // Wait 5s before restart
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
      },
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "logs/aipyram-err.log",
      out_file: "logs/aipyram-out.log"
    }
  ]
};

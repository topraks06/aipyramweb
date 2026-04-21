module.exports = {
  apps: [
    {
      name: "aipyram-master-brain",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      instances: 1, 
      autorestart: true,
      watch: false, 
      max_memory_restart: "2G", 
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "logs/aipyram-brain-error.log",
      out_file: "logs/aipyram-brain-output.log",
    },
    {
      name: "trtex-master-cycle",
      script: "npx",
      args: "tsx run_agent.ts --daemon",
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "logs/trtex-cycle-error.log",
      out_file: "logs/trtex-cycle-output.log",
    },
    {
      name: "trtex-ticker-refresh",
      script: "npx",
      args: "tsx -e \"const http=require('http');setInterval(()=>{http.get('http://localhost:3000/api/cron/ticker-refresh',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>console.log('[TICKER]',new Date().toISOString(),d.substring(0,100)))}).on('error',e=>console.error('[TICKER ERR]',e.message))},300000);console.log('[TICKER] Started — every 5m')\"",
      autorestart: true,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "aipyram-night-watch",
      script: "npx", 
      args: "tsx src/core/tests/test-swarm.ts", 
      cron_restart: "0 3 * * *", // Her gece 03:00'te uyan
      autorestart: false,
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "aipyram-cloud-worker",
      script: "npx",
      args: "tsx src/core/swarm/localNexusWorker.ts",
      autorestart: true,
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};

module.exports = {
  apps: [{
    name: 'iskcon-juhu',
    script: 'dist/index.js',
    cwd: '/var/www/iskcon-juhu',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
};
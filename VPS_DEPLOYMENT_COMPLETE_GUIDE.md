# VPS Deployment Complete Guide

## Current Issue
The ecosystem.config.js file is missing from your VPS. Let's create it and start the application.

## Step 1: Create the PM2 configuration file
Run this command in your VPS terminal:

```bash
cat > /var/www/iskcon-juhu/ecosystem.config.js << 'EOF'
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
EOF
```

## Step 2: Start the application
```bash
cd /var/www/iskcon-juhu && pm2 start ecosystem.config.js
```

## Step 3: Check status and test
```bash
pm2 status
curl http://localhost:3000
```

## Complete Single Command
Copy and paste this entire block:

```bash
cat > /var/www/iskcon-juhu/ecosystem.config.js << 'EOF'
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
EOF

cd /var/www/iskcon-juhu && pm2 start ecosystem.config.js && sleep 3 && pm2 status && curl http://localhost:3000
```

## Expected Result
After running this, you should see:
- PM2 status showing "iskcon-juhu" as "online"
- HTML output from curl command
- Your application accessible at http://YOUR_VPS_IP:3000

## Final Access Points
- **Main Website**: http://YOUR_VPS_IP:3000
- **Admin Panel**: http://YOUR_VPS_IP:3000/admin
- **Login**: username: isk_conjuhuadmin, password: isk_conjuhukrishnaconsiousness

Your ISKCON Juhu donation system will be fully operational!
#!/bin/bash

echo "🔧 ISKCON Juhu VPS Deployment Fix Script"
echo "=========================================="

# Navigate to project directory
cd /var/www/iskcon-juhu

# Stop all PM2 processes
echo "Stopping all PM2 processes..."
pm2 stop all
pm2 delete all

# Check if port 80 is available
echo "Checking port 80 availability..."
sudo netstat -tlnp | grep :80

# Install PM2 globally if not installed
echo "Installing PM2 globally..."
sudo npm install -g pm2

# Configure firewall
echo "Configuring firewall..."
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000
sudo ufw --force enable

# Create ecosystem config for port 80
echo "Creating ecosystem config..."
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'iskcon-juhu',
    script: 'dist/index.js',
    cwd: '/var/www/iskcon-juhu',
    env: {
      NODE_ENV: 'production',
      PORT: 80,
      DATABASE_URL: 'postgresql://iskcon_user:iskcon123@localhost:5432/iskcon_juhu',
      PAYU_MERCHANT_KEY: '2fKjPt',
      PAYU_MERCHANT_SALT: 'zBqitHlab9VU52l9ZDv8x5D1rxYBtgat',
      SESSION_SECRET: 'vps_production_session_secret_key_iskcon_juhu_2025'
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

# Start application with sudo on port 80
echo "Starting application on port 80..."
sudo pm2 start ecosystem.config.cjs

# Save PM2 configuration
echo "Saving PM2 configuration..."
sudo pm2 save
sudo pm2 startup

# Check status
echo "Checking PM2 status..."
sudo pm2 list

# Test local connection
echo "Testing local connection..."
curl -I http://localhost:80

echo "✅ Deployment fix completed!"
echo "Your website should now be accessible at: http://31.97.201.176"
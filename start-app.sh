#!/bin/bash
echo "🚀 Starting ISKCON Juhu Application..."

# Make sure we're in the right directory
cd /var/www/iskcon-juhu

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Start with PM2
echo "📦 Starting application with PM2..."
pm2 start ecosystem.config.js

# Wait for startup
echo "⏳ Waiting for startup..."
sleep 3

# Check status
echo "📊 Application status:"
pm2 status

# Test connection
echo "🔍 Testing connection..."
curl http://localhost:3000

echo "✅ Setup complete!"
echo "🌐 Your application should now be accessible at:"
echo "   - Main site: http://YOUR_VPS_IP:3000"
echo "   - Admin panel: http://YOUR_VPS_IP:3000/admin"
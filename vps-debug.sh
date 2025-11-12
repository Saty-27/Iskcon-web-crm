#!/bin/bash

echo "=== ISKCON Juhu VPS Debug Script ==="

# Check if app is running
echo "1. Checking PM2 status:"
pm2 status

echo -e "\n2. Checking what's running on port 3000:"
lsof -i :3000 2>/dev/null || echo "No process found on port 3000"

echo -e "\n3. Checking all Node.js processes:"
ps aux | grep node | grep -v grep

echo -e "\n4. Checking PM2 logs for errors:"
pm2 logs iskcon-juhu --lines 10

echo -e "\n5. Testing different localhost addresses:"
curl -I http://127.0.0.1:3000 2>/dev/null || echo "127.0.0.1:3000 failed"
curl -I http://0.0.0.0:3000 2>/dev/null || echo "0.0.0.0:3000 failed"

echo -e "\n6. Checking environment variables:"
cd /var/www/iskcon-juhu
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

echo -e "\n7. Checking if built files exist:"
ls -la dist/ 2>/dev/null || echo "No dist/ folder found"

echo -e "\n=== Debug Complete ==="
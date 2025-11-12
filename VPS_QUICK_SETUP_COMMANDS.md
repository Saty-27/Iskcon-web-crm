# VPS Quick Setup Commands

The build was successful but PM2 needs to be restarted properly. Run these commands one by one:

## Step 1: Check current PM2 processes
```bash
pm2 list
```

## Step 2: Kill all PM2 processes and restart
```bash
pm2 kill
pm2 start ecosystem.config.js
```

## Step 3: Check status
```bash
pm2 status
```

## Step 4: Test the application
```bash
curl http://localhost:3000
```

## Step 5: If still not working, try manual start
```bash
# Set environment variables
export NODE_ENV=production
export PORT=3000

# Start directly
node dist/index.js
```

## Step 6: Check if port 3000 is available
```bash
netstat -tlnp | grep 3000
```

## Alternative: Single command fix
```bash
pm2 kill && pm2 start ecosystem.config.js && pm2 status && sleep 2 && curl http://localhost:3000
```

If you see HTML output from the curl command, your application is working!

## Final verification URLs:
- Main site: http://YOUR_VPS_IP:3000
- Admin panel: http://YOUR_VPS_IP:3000/admin
- API test: http://YOUR_VPS_IP:3000/api/donation-categories
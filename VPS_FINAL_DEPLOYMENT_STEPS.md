# VPS Final Deployment Steps

## The Issue
The PM2 configuration was using port 5000, but the application was trying to connect to port 3000.

## Solution
Run these commands in your VPS terminal:

```bash
# 1. Rebuild the application with the fixed configuration
npm run build

# 2. Restart PM2 with the corrected config
pm2 delete iskcon-juhu
pm2 start ecosystem.config.js

# 3. Check if the application is running
pm2 status

# 4. Test the connection
curl http://localhost:3000

# 5. Check the logs if there are any issues
pm2 logs iskcon-juhu
```

## Alternative Quick Fix
If the above doesn't work, run this single command:

```bash
cd /var/www/iskcon-juhu && npm run build && pm2 delete iskcon-juhu && pm2 start ecosystem.config.js && pm2 status && curl http://localhost:3000
```

## Expected Result
After running these commands, you should see:
- PM2 status showing "iskcon-juhu" as "online"
- curl command returning HTML content
- Application accessible at http://YOUR_VPS_IP:3000

## If Still Having Issues
1. Check if port 3000 is available: `netstat -tlnp | grep 3000`
2. Check PM2 logs: `pm2 logs iskcon-juhu`
3. Restart the entire process: `pm2 restart iskcon-juhu`

## Final Test
Once working, test these URLs:
- `http://YOUR_VPS_IP:3000` - Main website
- `http://YOUR_VPS_IP:3000/admin` - Admin panel
- `http://YOUR_VPS_IP:3000/api/donation-categories` - API test

Your ISKCON Juhu system should now be fully operational!
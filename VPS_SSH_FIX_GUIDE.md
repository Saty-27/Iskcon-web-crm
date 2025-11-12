# VPS SSH Connection Fix Guide

## Current Issue
You're getting SSH authentication errors when trying to connect to your VPS. This is common and can be resolved.

## Solution 1: Connect with Password Authentication

Try connecting with password instead of SSH key:

```bash
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no root@31.97.201.176
```

## Solution 2: Generate New SSH Key (if needed)

If you don't have an SSH key:

```bash
# Generate new SSH key
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/id_rsa.pub root@31.97.201.176
```

## Solution 3: Manual Deployment Steps

If SSH is still problematic, you can deploy manually by:

1. **Upload files via FTP/SFTP** or your VPS control panel
2. **Run commands directly** in your VPS terminal/console

## Alternative: Use VPS Control Panel

Most VPS providers offer a web-based terminal. Access it through:
- Your VPS provider's control panel
- Web terminal/console option
- Direct server access

## Manual Deployment Commands

Once you have access to your VPS terminal, run these commands:

```bash
# Navigate to project directory
cd /var/www/iskcon-juhu

# Check if files exist
ls -la

# Make deployment script executable
chmod +x vps-deploy.sh

# Run deployment
./vps-deploy.sh
```

## If Project Files Don't Exist

Upload your project files to `/var/www/iskcon-juhu/` and ensure:
- All files are present
- Node.js and npm are installed
- PostgreSQL is running
- .env file is configured

## Database Setup Commands

```bash
# Test database connection
psql -h localhost -U iskcon_user -d iskcon_juhu_db -c "SELECT 1;"

# Create schema
npm run db:push

# Import data
psql -h localhost -U iskcon_user -d iskcon_juhu_db -f final-import.sql

# Build and start
npm run build
pm2 start ecosystem.config.js
```

## Next Steps

1. Try connecting with password authentication first
2. If successful, run the deployment script
3. If not, use your VPS control panel's web terminal
4. Follow the manual deployment steps above

Let me know which method works for you, and I'll provide more specific guidance.
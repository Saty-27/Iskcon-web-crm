# GitHub to VPS Deployment Guide

This guide walks you through uploading your ISKCON Juhu Donation System to GitHub and then deploying it to your VPS hosting.

## Step 1: Prepare Project for GitHub

### 1.1 Initialize Git Repository
```bash
# In your project directory
git init
git add .
git commit -m "Initial commit: ISKCON Juhu Donation System"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com) and log in
2. Click "New repository" or the "+" icon
3. Repository name: `iskcon-juhu-donation-system`
4. Description: `ISKCON Juhu Temple Donation Management System`
5. Set to **Public** or **Private** (your choice)
6. **DO NOT** initialize with README (we already have one)
7. Click "Create repository"

### 1.3 Push to GitHub
```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/iskcon-juhu-donation-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: VPS Setup and Deployment

### 2.1 Connect to Your VPS
```bash
ssh root@your-vps-ip
# OR
ssh username@your-vps-ip
```

### 2.2 Run Automated Setup Script
```bash
# Download and run the setup script
curl -O https://raw.githubusercontent.com/yourusername/iskcon-juhu-donation-system/main/vps-setup-script.sh
chmod +x vps-setup-script.sh
./vps-setup-script.sh
```

**The script will ask for:**
- Domain name (e.g., `iskconjuhu.com`)
- Email for SSL certificate
- Database password

### 2.3 Clone Your Project
```bash
# Navigate to application directory
cd /var/www/iskcon-juhu

# Clone your GitHub repository
git clone https://github.com/yourusername/iskcon-juhu-donation-system.git .
```

### 2.4 Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit with your production values
nano .env
```

**Add these production values:**
```env
NODE_ENV=production
PORT=3000

# Database (use the password you set during setup)
DATABASE_URL=postgresql://iskcon_admin:your_db_password@localhost:5432/iskcon_juhu_db
PGHOST=localhost
PGPORT=5432
PGDATABASE=iskcon_juhu_db
PGUSER=iskcon_admin
PGPASSWORD=your_db_password

# Generate secure secrets (32+ characters)
JWT_SECRET=your_very_secure_jwt_secret_here_minimum_32_characters
SESSION_SECRET=your_very_secure_session_secret_here_minimum_32_characters

# PayU Production Credentials
PAYU_MERCHANT_KEY=your_payu_merchant_key
PAYU_MERCHANT_SALT=your_payu_merchant_salt
PAYU_BASE_URL=https://secure.payu.in/_payment

# Twilio for WhatsApp (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password

# URLs (use your actual domain)
APP_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
```

### 2.5 Deploy Application
```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 2.6 Start Application
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status
```

## Step 3: Verify Deployment

### 3.1 Check Application Status
```bash
# Check PM2 processes
pm2 status

# View logs
pm2 logs iskcon-juhu

# Check Nginx
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql
```

### 3.2 Test Website
1. Visit your domain: `https://your-domain.com`
2. Test admin login: `https://your-domain.com/login`
3. Create a test donation
4. Check admin panel functionality

## Step 4: Future Updates

### 4.1 Update Process
```bash
# On your local machine - make changes and push
git add .
git commit -m "Update description"
git push origin main

# On your VPS - pull and deploy
cd /var/www/iskcon-juhu
git pull origin main
./deploy.sh
```

### 4.2 Quick Update Script
Create this script for easy updates:

```bash
# Create update script
nano /var/www/iskcon-juhu/update.sh
```

Add this content:
```bash
#!/bin/bash
cd /var/www/iskcon-juhu

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Running migrations..."
npm run db:push

echo "Restarting application..."
pm2 restart iskcon-juhu

echo "Update completed!"
pm2 status
```

Make it executable:
```bash
chmod +x /var/www/iskcon-juhu/update.sh
```

## Step 5: Monitoring and Maintenance

### 5.1 Essential Commands
```bash
# Check application logs
pm2 logs iskcon-juhu

# Monitor real-time logs
pm2 logs iskcon-juhu --lines 100

# Restart application
pm2 restart iskcon-juhu

# Check system resources
htop

# Check disk space
df -h

# Check database connections
sudo -u postgres psql -d iskcon_juhu_db -c "SELECT count(*) FROM pg_stat_activity;"
```

### 5.2 Backup and Security
```bash
# Manual backup
sudo /usr/local/bin/backup-iskcon.sh

# Check backup files
ls -la /var/backups/iskcon-juhu/

# Check firewall status
sudo ufw status

# Check Fail2Ban status
sudo fail2ban-client status
```

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs iskcon-juhu
   
   # Check port conflicts
   sudo netstat -tulpn | grep :3000
   ```

2. **Database connection errors**
   ```bash
   # Test database connection
   psql -h localhost -U iskcon_admin -d iskcon_juhu_db
   
   # Check PostgreSQL logs
   sudo journalctl -u postgresql
   ```

3. **Nginx errors**
   ```bash
   # Check Nginx configuration
   sudo nginx -t
   
   # Check Nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

4. **SSL certificate issues**
   ```bash
   # Check certificate
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   ```

## Security Checklist

- [ ] Change default database password
- [ ] Use strong JWT and session secrets
- [ ] Enable firewall (UFW)
- [ ] Configure Fail2Ban
- [ ] Regular system updates
- [ ] Monitor application logs
- [ ] Regular backups
- [ ] SSL certificate auto-renewal

## Success Indicators

✅ **Website loads**: `https://your-domain.com`  
✅ **Admin login works**: Login with admin credentials  
✅ **Donations processing**: Test payment flow  
✅ **SSL certificate**: Green padlock in browser  
✅ **PM2 running**: Application shows as "online"  
✅ **Database connected**: Admin panel loads data  
✅ **File uploads work**: Admin can upload images  

Your ISKCON Juhu Donation System is now live and production-ready!
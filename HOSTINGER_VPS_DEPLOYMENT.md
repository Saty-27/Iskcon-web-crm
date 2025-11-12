# ISKCON Juhu - Hostinger VPS Deployment Guide

## 🚀 Complete Deployment Steps for Hostinger VPS

### Prerequisites
- ✅ Hostinger VPS server (running Ubuntu)
- ✅ Your domain name
- ✅ Neon PostgreSQL database (already configured)
- ✅ PayU/Razorpay credentials
- ✅ SSH access to your VPS

---

## Step 1: Access Your Hostinger VPS

```bash
# Get your VPS IP from Hostinger control panel
ssh root@your-vps-ip-address

# You'll be prompted for your password
```

---

## Step 2: Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install other dependencies
sudo apt install -y git nginx

# Verify installations
node --version  # Should show v20.x
npm --version
```

---

## Step 3: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify
pm2 --version
```

---

## Step 4: Upload Your Code to VPS

### Option A: Using Git (Recommended)

```bash
# Create app directory
sudo mkdir -p /var/www/iskcon-juhu
sudo chown -R $USER:$USER /var/www/iskcon-juhu
cd /var/www/iskcon-juhu

# Clone from GitHub (if your code is on GitHub)
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git .
```

### Option B: Upload from Replit

```bash
# On your local machine/Replit, create a zip of your project
# Then upload to VPS using SCP:
scp iskcon-juhu.zip root@your-vps-ip:/var/www/

# On VPS, unzip
cd /var/www
unzip iskcon-juhu.zip -d iskcon-juhu
cd iskcon-juhu
```

### Option C: Direct Upload via SFTP
- Use FileZilla or WinSCP
- Connect to your VPS IP
- Upload all files to `/var/www/iskcon-juhu`

---

## Step 5: Configure Environment Variables

```bash
cd /var/www/iskcon-juhu

# Create production .env file
nano .env
```

**Add these environment variables:**

```env
# Database (Your Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/iskcon_juhu?sslmode=require

# Application
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_very_secure_random_secret_key_change_this

# JWT (for authentication)
JWT_SECRET=your_jwt_secret_key_change_this

# PayU Payment Gateway (LIVE credentials)
PAYU_MERCHANT_KEY=your_live_payu_merchant_key
PAYU_MERCHANT_SALT=your_live_payu_salt
PAYU_BASE_URL=https://secure.payu.in

# Razorpay (if using)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Twilio (for WhatsApp notifications)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_whatsapp_number

# SendGrid (for emails)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=donations@iskconjuhu.org

# UPI
UPI_ID=iskconjuhu@sbi
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 6: Install Dependencies & Build

```bash
cd /var/www/iskcon-juhu

# Install all packages
npm install

# Build the production app
npm run build

# This creates optimized production files in dist/ folder
```

---

## Step 7: Initialize Database Tables

```bash
# Create all database tables
npm run db:push
```

This will create all tables in your Neon PostgreSQL database.

---

## Step 8: Start App with PM2

```bash
cd /var/www/iskcon-juhu

# Start the application
pm2 start dist/index.js --name iskcon-juhu

# Save PM2 configuration
pm2 save

# Make PM2 auto-start on server reboot
pm2 startup
# Copy and run the command PM2 shows you

# Check if app is running
pm2 status
pm2 logs iskcon-juhu
```

---

## Step 9: Configure Nginx (Web Server)

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/iskcon-juhu
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # For file uploads
    client_max_body_size 20M;

    # Proxy all requests to Node.js app
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files directly
    location /uploads/ {
        alias /var/www/iskcon-juhu/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable the site:**

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/iskcon-juhu /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 10: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 11: Set Up SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (FREE)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose option 2 (redirect HTTP to HTTPS)

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Step 12: Point Your Domain to VPS

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS settings
3. Add/Update these records:

```
Type: A
Name: @
Value: YOUR-VPS-IP-ADDRESS

Type: A
Name: www
Value: YOUR-VPS-IP-ADDRESS
```

4. Wait 10-30 minutes for DNS propagation

---

## Step 13: Create Uploads Directory

```bash
cd /var/www/iskcon-juhu

# Create directories for file uploads
mkdir -p uploads/{banners,gallery,videos,qr-codes,cards,blog,social-icons}

# Set permissions
chmod -R 755 uploads
```

---

## ✅ DEPLOYMENT COMPLETE!

Your website should now be live at: **https://your-domain.com**

---

## 🔧 Useful Commands

### Check Application Status
```bash
pm2 status                    # View all PM2 apps
pm2 logs iskcon-juhu          # View live logs
pm2 restart iskcon-juhu       # Restart app
pm2 stop iskcon-juhu          # Stop app
```

### Update Application (After Changes)
```bash
cd /var/www/iskcon-juhu
git pull origin main          # If using Git
npm install                   # Install new dependencies
npm run build                 # Rebuild
pm2 restart iskcon-juhu       # Restart app
```

### Check Nginx Status
```bash
sudo nginx -t                 # Test config
sudo systemctl status nginx   # Check status
sudo systemctl restart nginx  # Restart Nginx
```

### View Logs
```bash
pm2 logs iskcon-juhu                    # App logs
sudo tail -f /var/log/nginx/error.log   # Nginx errors
sudo tail -f /var/log/nginx/access.log  # Nginx access
```

---

## 🐛 Troubleshooting

### Issue: App not starting
```bash
# Check logs
pm2 logs iskcon-juhu

# Check if port 5000 is available
sudo lsof -i :5000

# Restart app
pm2 restart iskcon-juhu
```

### Issue: Database connection failed
```bash
# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test connection manually
# Make sure your Neon database allows connections from your VPS IP
```

### Issue: Cannot access website
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check if app is running
pm2 status

# Check firewall
sudo ufw status
```

### Issue: SSL certificate error
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## 📦 Database Backup Setup

```bash
# Create backup script
nano /home/backup.sh
```

**Add this script:**

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/iskcon-juhu"

mkdir -p $BACKUP_DIR

# Backup database (using Neon)
# You can also set up Neon's built-in backups in their dashboard

# Backup uploads folder
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/iskcon-juhu/uploads

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

**Make executable and schedule:**

```bash
chmod +x /home/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /home/backup.sh
```

---

## 🔐 Security Checklist

- ✅ SSL certificate installed
- ✅ Firewall configured
- ✅ Strong passwords in .env
- ✅ Database password is secure
- ✅ Admin password changed from default
- ✅ Regular backups configured
- ✅ Keep server updated: `sudo apt update && sudo apt upgrade`

---

## 📞 Admin Access

**Admin Login:**
- URL: `https://your-domain.com/login`
- Username: `isk_conjuhuadmin`
- Password: `isk_conjuhukrishnaconsiousness`

**⚠️ IMPORTANT: Change this password after first login!**

---

## 🎉 Your ISKCON Juhu website is now LIVE!

All features are working:
- ✅ Online donations with PayU/Razorpay
- ✅ Event management
- ✅ Gallery and videos
- ✅ Admin dashboard
- ✅ Automatic receipts
- ✅ WhatsApp notifications
- ✅ Email notifications

---

## 📚 Additional Resources

- **Hostinger Help:** https://www.hostinger.com/tutorials/vps
- **PM2 Documentation:** https://pm2.keymetrics.io/docs/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **Neon PostgreSQL:** https://neon.tech/docs

---

**Need Help?** Check the logs first:
- `pm2 logs iskcon-juhu` - Application logs
- `sudo tail -f /var/log/nginx/error.log` - Web server errors

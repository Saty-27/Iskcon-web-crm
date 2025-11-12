# VPS Deployment Guide for ISKCON Juhu Donation System

## Prerequisites

Before deploying to your VPS, ensure you have:

1. **VPS Server** with Ubuntu 20.04+ or CentOS 7+
2. **Root or sudo access** to your server
3. **Domain name** pointing to your VPS IP (optional but recommended)
4. **PostgreSQL database** (cloud or local)
5. **PayU merchant account** credentials
6. **SSL certificate** for HTTPS (Let's Encrypt recommended)

## Step 1: Prepare Your VPS Server

### 1.1 Connect to Your VPS
```bash
ssh root@your-server-ip
# or
ssh your-username@your-server-ip
```

### 1.2 Update System Packages
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 1.3 Install Required Software
```bash
# Ubuntu/Debian
sudo apt install -y curl git nginx postgresql-client

# CentOS/RHEL
sudo yum install -y curl git nginx postgresql
```

### 1.4 Install Node.js 20+
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.5 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## Step 2: Set Up Your Application

### 2.1 Create Application Directory
```bash
sudo mkdir -p /var/www/iskcon-juhu
sudo chown -R $USER:$USER /var/www/iskcon-juhu
cd /var/www/iskcon-juhu
```

### 2.2 Upload Your Project Files
You have several options:

**Option A: Using Git (Recommended)**
```bash
# If you have the project in a Git repository
git clone https://github.com/yourusername/iskcon-juhu-donation.git .
```

**Option B: Using SCP/SFTP**
```bash
# From your local machine, upload the project files
scp -r /path/to/your/project/* user@your-server-ip:/var/www/iskcon-juhu/
```

**Option C: Using rsync**
```bash
# From your local machine
rsync -avz /path/to/your/project/ user@your-server-ip:/var/www/iskcon-juhu/
```

### 2.3 Install Dependencies
```bash
cd /var/www/iskcon-juhu
npm install
```

### 2.4 Create Production Environment File
```bash
cp .env.example .env
nano .env
```

Add your production environment variables:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/iskcon_juhu

# PayU Configuration (LIVE)
PAYU_MERCHANT_KEY=your_live_payu_key
PAYU_MERCHANT_SALT=your_live_payu_salt
PAYU_BASE_URL=https://secure.payu.in

# UPI Configuration
UPI_ID=iskconjuhu@sbi

# Twilio Configuration (for WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# App Configuration
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_very_secure_session_secret_here

# Email Configuration (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@iskconjuhu.org
```

### 2.5 Build the Application
```bash
npm run build
```

## Step 3: Database Setup

### 3.1 Set Up PostgreSQL Database
If you don't have a cloud database, install PostgreSQL locally:

```bash
# Ubuntu/Debian
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE iskcon_juhu;
CREATE USER iskcon_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE iskcon_juhu TO iskcon_user;
\q
```

### 3.2 Run Database Migrations
```bash
cd /var/www/iskcon-juhu
npm run db:push
```

## Step 4: Configure Nginx

### 4.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/iskcon-juhu
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (update paths for your certificates)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Client max body size for file uploads
    client_max_body_size 10M;

    # Proxy to Node.js app
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

    # Serve static files directly
    location /uploads/ {
        alias /var/www/iskcon-juhu/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

### 4.2 Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/iskcon-juhu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5: Set Up SSL Certificate

### 5.1 Install Certbot
```bash
# Ubuntu/Debian
sudo apt install -y certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install -y certbot python3-certbot-nginx
```

### 5.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 5.3 Set Up Auto-renewal
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 6: Start the Application

### 6.1 Create PM2 Ecosystem File
```bash
nano /var/www/iskcon-juhu/ecosystem.config.js
```

Add this configuration:
```javascript
module.exports = {
  apps: [{
    name: 'iskcon-juhu',
    script: 'dist/index.js',
    cwd: '/var/www/iskcon-juhu',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: '/var/log/iskcon-juhu/error.log',
    out_file: '/var/log/iskcon-juhu/access.log',
    log_file: '/var/log/iskcon-juhu/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### 6.2 Create Log Directory
```bash
sudo mkdir -p /var/log/iskcon-juhu
sudo chown -R $USER:$USER /var/log/iskcon-juhu
```

### 6.3 Start the Application
```bash
cd /var/www/iskcon-juhu
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 7: Configure Firewall

### 7.1 UFW (Ubuntu/Debian)
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 7.2 Firewalld (CentOS/RHEL)
```bash
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Step 8: Set Up Monitoring and Backups

### 8.1 Monitor Application
```bash
# View logs
pm2 logs iskcon-juhu

# Monitor processes
pm2 monit

# Restart application
pm2 restart iskcon-juhu
```

### 8.2 Database Backup Script
```bash
nano /home/backup-db.sh
```

Add this script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/iskcon-juhu"
DB_NAME="iskcon_juhu"
DB_USER="iskcon_user"

mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Database backup completed: backup_$DATE.sql"
```

Make it executable and add to cron:
```bash
chmod +x /home/backup-db.sh
crontab -e
# Add this line for daily backup at 2 AM:
0 2 * * * /home/backup-db.sh
```

## Step 9: Final Configuration

### 9.1 Create Uploads Directory
```bash
mkdir -p /var/www/iskcon-juhu/uploads/{banners,gallery,videos,qr-codes,receipts}
chown -R $USER:$USER /var/www/iskcon-juhu/uploads
```

### 9.2 Set Proper Permissions
```bash
chmod -R 755 /var/www/iskcon-juhu
chmod -R 777 /var/www/iskcon-juhu/uploads
```

## Step 10: Testing Your Deployment

### 10.1 Check Application Status
```bash
pm2 status
curl -I http://localhost:5000
```

### 10.2 Test Database Connection
```bash
cd /var/www/iskcon-juhu
node -e "console.log('Testing database connection...'); process.exit(0);"
```

### 10.3 Test SSL Certificate
```bash
curl -I https://your-domain.com
```

## Troubleshooting

### Common Issues

1. **Port 5000 already in use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **Database connection failed**
   - Check DATABASE_URL in .env
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`

3. **Nginx configuration errors**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **PM2 process not starting**
   ```bash
   pm2 logs iskcon-juhu
   pm2 restart iskcon-juhu
   ```

5. **File upload issues**
   - Check uploads directory permissions
   - Verify nginx client_max_body_size

### Log Files to Check
- Application logs: `pm2 logs iskcon-juhu`
- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`
- System logs: `/var/log/syslog`

## Maintenance

### Regular Tasks
1. **Update dependencies** (monthly)
2. **Monitor disk space** and clean old logs
3. **Check SSL certificate** expiry
4. **Review security updates**
5. **Test backup restoration**

### Update Application
```bash
cd /var/www/iskcon-juhu
git pull origin main  # if using git
npm install
npm run build
pm2 restart iskcon-juhu
```

Your ISKCON Juhu donation system should now be running on your VPS with proper security, monitoring, and backup systems in place.
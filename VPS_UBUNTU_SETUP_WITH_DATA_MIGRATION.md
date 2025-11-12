# Complete VPS Ubuntu Setup with Database Migration

## Step 1: Fresh Ubuntu Server Setup

### 1.1 Connect to Your VPS
```bash
ssh root@your-vps-ip
```

### 1.2 Update Ubuntu System
```bash
apt update && apt upgrade -y
```

### 1.3 Install Essential Packages
```bash
apt install -y curl wget git nginx postgresql postgresql-contrib ufw fail2ban
```

### 1.4 Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version
```

### 1.5 Install PM2 Process Manager
```bash
npm install -g pm2
```

## Step 2: PostgreSQL Database Setup

### 2.1 Configure PostgreSQL
```bash
# Start PostgreSQL service
systemctl start postgresql
systemctl enable postgresql

# Switch to postgres user
sudo -u postgres psql
```

### 2.2 Create Database and User
```sql
-- In PostgreSQL shell
CREATE DATABASE iskcon_juhu;
CREATE USER iskcon_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE iskcon_juhu TO iskcon_user;
ALTER USER iskcon_user CREATEDB;
\q
```

### 2.3 Configure PostgreSQL for Remote Access (if needed)
```bash
# Edit postgresql.conf
nano /etc/postgresql/14/main/postgresql.conf
# Find and uncomment: listen_addresses = 'localhost'

# Edit pg_hba.conf
nano /etc/postgresql/14/main/pg_hba.conf
# Add line: local   all   iskcon_user   md5

# Restart PostgreSQL
systemctl restart postgresql
```

## Step 3: Export Data from Replit Database

### 3.1 Get Database Connection String
In your Replit project, the DATABASE_URL is already available. Note it down.

### 3.2 Export Current Database Data
```bash
# Install PostgreSQL client tools if not already installed
sudo apt install postgresql-client

# Export your current Replit database
pg_dump "your_replit_database_url_here" > replit_backup.sql

# Example:
# pg_dump "postgresql://username:password@hostname:port/database" > replit_backup.sql
```

### 3.3 Import Data to Your VPS Database
```bash
# Import the backup to your VPS database
psql -h localhost -U iskcon_user -d iskcon_juhu < replit_backup.sql
```

## Step 4: Deploy Your Application

### 4.1 Create Application Directory
```bash
mkdir -p /var/www/iskcon-juhu
cd /var/www/iskcon-juhu
```

### 4.2 Upload Your Project Files
Choose one method:

**Method A: Copy files from local machine**
```bash
# From your local machine where you have the project
scp -r /path/to/your/project/* root@your-vps-ip:/var/www/iskcon-juhu/
```

**Method B: Download from Replit**
```bash
# If you have the project in a zip file
wget https://your-replit-export-url/project.zip
unzip project.zip
```

**Method C: Git Clone (if project is in Git)**
```bash
git clone https://github.com/yourusername/iskcon-juhu.git .
```

### 4.3 Install Dependencies
```bash
cd /var/www/iskcon-juhu
npm install
```

### 4.4 Configure Environment Variables
```bash
cp .env.example .env
nano .env
```

Add your production environment:
```env
# Database Configuration
DATABASE_URL=postgresql://iskcon_user:your_secure_password_here@localhost:5432/iskcon_juhu

# PayU Configuration (LIVE)
PAYU_MERCHANT_KEY=2fKjPt
PAYU_MERCHANT_SALT=zBqitHlab9VU52l9ZDv8x5D1rxYBtgat
PAYU_BASE_URL=https://secure.payu.in

# UPI Configuration
UPI_ID=iskconjuhu@sbi

# Twilio Configuration (for WhatsApp notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# App Configuration
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_very_secure_session_secret_here_make_it_long_and_random

# Email Configuration (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@iskconjuhu.org
```

### 4.5 Build the Application
```bash
npm run build
```

### 4.6 Create Uploads Directory
```bash
mkdir -p uploads/{banners,gallery,videos,qr-codes,receipts}
chown -R www-data:www-data uploads
chmod -R 755 uploads
```

### 4.7 Run Database Migrations
```bash
npm run db:push
```

## Step 5: Configure Nginx Web Server

### 5.1 Create Nginx Configuration
```bash
nano /etc/nginx/sites-available/iskcon-juhu
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

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

### 5.2 Enable the Site
```bash
ln -s /etc/nginx/sites-available/iskcon-juhu /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

## Step 6: Create PM2 Configuration

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
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    error_file: '/var/log/iskcon-juhu/error.log',
    out_file: '/var/log/iskcon-juhu/access.log',
    log_file: '/var/log/iskcon-juhu/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
};
```

### 6.2 Create Log Directory
```bash
mkdir -p /var/log/iskcon-juhu
chown -R $USER:$USER /var/log/iskcon-juhu
```

### 6.3 Start Application with PM2
```bash
cd /var/www/iskcon-juhu
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 7: Configure Firewall

### 7.1 Set up UFW Firewall
```bash
ufw allow ssh
ufw allow 'Nginx Full'
ufw enable
ufw status
```

### 7.2 Configure Fail2Ban (Optional but recommended)
```bash
systemctl enable fail2ban
systemctl start fail2ban
```

## Step 8: SSL Certificate Setup (Optional but Recommended)

### 8.1 Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 8.2 Obtain SSL Certificate
```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 8.3 Set Up Auto-renewal
```bash
crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 9: Data Migration Script

### 9.1 Create Data Migration Script
```bash
nano /var/www/iskcon-juhu/migrate-data.js
```

Add this Node.js script:
```javascript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';

const sourceDb = postgres(process.env.SOURCE_DATABASE_URL);
const targetDb = postgres(process.env.DATABASE_URL);

const source = drizzle(sourceDb, { schema });
const target = drizzle(targetDb, { schema });

async function migrateData() {
  console.log('Starting data migration...');
  
  try {
    // Migrate all tables
    const tables = [
      'users', 'banners', 'donation_categories', 'donation_cards', 
      'donations', 'events', 'gallery', 'videos', 'testimonials',
      'social_links', 'schedules', 'stats', 'quotes', 'live_videos',
      'blog_posts', 'bank_details', 'messages'
    ];
    
    for (const table of tables) {
      console.log(`Migrating ${table}...`);
      const data = await source.select().from(schema[table]);
      if (data.length > 0) {
        await target.insert(schema[table]).values(data);
        console.log(`✓ Migrated ${data.length} records from ${table}`);
      }
    }
    
    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sourceDb.end();
    await targetDb.end();
  }
}

migrateData();
```

### 9.2 Run Data Migration
```bash
cd /var/www/iskcon-juhu
SOURCE_DATABASE_URL="your_replit_database_url" node migrate-data.js
```

## Step 10: Testing Your Deployment

### 10.1 Test Application
```bash
# Check PM2 status
pm2 status

# Check if app is running
curl -I http://localhost:5000

# Check logs
pm2 logs iskcon-juhu
```

### 10.2 Test Database Connection
```bash
# Test database connection
psql -h localhost -U iskcon_user -d iskcon_juhu -c "SELECT COUNT(*) FROM users;"
```

### 10.3 Test Payment Gateway
Visit your website and test:
- Donation form submission
- PayU payment redirection
- UPI payment options
- Receipt generation

## Step 11: Backup and Monitoring

### 11.1 Create Backup Script
```bash
nano /home/backup-script.sh
```

Add this backup script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/iskcon-juhu"
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U iskcon_user iskcon_juhu > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/iskcon-juhu/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### 11.2 Set Up Automatic Backups
```bash
chmod +x /home/backup-script.sh
crontab -e
# Add this line for daily backup at 2 AM:
0 2 * * * /home/backup-script.sh
```

### 11.3 Monitor Application
```bash
# View real-time logs
pm2 logs iskcon-juhu

# Monitor system resources
pm2 monit

# Check nginx status
systemctl status nginx

# Check PostgreSQL status
systemctl status postgresql
```

## Troubleshooting Common Issues

### Issue 1: Database Connection Failed
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Check database exists
sudo -u postgres psql -l

# Test connection
psql -h localhost -U iskcon_user -d iskcon_juhu
```

### Issue 2: Application Not Starting
```bash
# Check PM2 logs
pm2 logs iskcon-juhu

# Check if port is in use
lsof -i :5000

# Restart application
pm2 restart iskcon-juhu
```

### Issue 3: File Upload Issues
```bash
# Check uploads directory permissions
ls -la /var/www/iskcon-juhu/uploads/
chown -R www-data:www-data /var/www/iskcon-juhu/uploads/
chmod -R 755 /var/www/iskcon-juhu/uploads/
```

### Issue 4: PayU Payment Issues
- Verify PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in .env
- Check PAYU_BASE_URL is set to https://secure.payu.in for live
- Ensure your domain is whitelisted in PayU dashboard

## Final Verification Checklist

- [ ] Ubuntu server updated and secured
- [ ] PostgreSQL installed and configured
- [ ] Database migrated from Replit successfully
- [ ] Node.js application deployed and running
- [ ] Nginx configured and serving requests
- [ ] PM2 managing application process
- [ ] Firewall configured and enabled
- [ ] SSL certificate installed (if applicable)
- [ ] Payment gateway tested and working
- [ ] File uploads working correctly
- [ ] Database backups configured
- [ ] Application logs accessible

Your ISKCON Juhu donation system is now fully deployed on your VPS with all data migrated from Replit!
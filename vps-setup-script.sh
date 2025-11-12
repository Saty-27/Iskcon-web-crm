#!/bin/bash

# ISKCON Juhu Donation System - VPS Setup Script
# This script automates the installation of all required components

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Get user input
read -p "Enter your domain name (e.g., iskconjuhu.com): " DOMAIN_NAME
read -p "Enter your email for SSL certificate: " EMAIL
read -s -p "Enter password for PostgreSQL database: " DB_PASSWORD
echo

print_status "Starting ISKCON Juhu Donation System installation..."

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 20
print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js installed: $NODE_VERSION"
print_status "NPM installed: $NPM_VERSION"

# Install PostgreSQL
print_status "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Configure PostgreSQL
print_status "Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE iskcon_juhu_db;"
sudo -u postgres psql -c "CREATE USER iskcon_admin WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE iskcon_juhu_db TO iskcon_admin;"
sudo -u postgres psql -c "ALTER USER iskcon_admin CREATEDB;"

# Enable PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Create Nginx configuration
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/iskcon-juhu > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Client max body size for file uploads
    client_max_body_size 50M;

    # Static files
    location /uploads/ {
        alias /var/www/iskcon-juhu/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Proxy to Node.js application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# Enable Nginx site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/iskcon-juhu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl start nginx

# Install SSL certificate
print_status "Installing SSL certificate..."
sudo apt install -y snapd
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Generate SSL certificate
print_status "Generating SSL certificate for $DOMAIN_NAME..."
sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email $EMAIL

# Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2

# Setup PM2 startup
print_status "Setting up PM2 startup..."
PM2_STARTUP=$(pm2 startup | grep "sudo env PATH")
eval $PM2_STARTUP

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/iskcon-juhu
sudo chown -R $USER:$USER /var/www/iskcon-juhu

# Create uploads directory
mkdir -p /var/www/iskcon-juhu/uploads
chmod 755 /var/www/iskcon-juhu/uploads

# Create log directory
sudo mkdir -p /var/log/iskcon-juhu
sudo chown -R $USER:$USER /var/log/iskcon-juhu

# Setup firewall
print_status "Configuring firewall..."
sudo apt install -y ufw
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Install Fail2Ban
print_status "Installing Fail2Ban..."
sudo apt install -y fail2ban

# Create Fail2Ban configuration
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-badbots]
enabled = true
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create environment file template
print_status "Creating environment file template..."
cat > /var/www/iskcon-juhu/.env.template <<EOF
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://iskcon_admin:$DB_PASSWORD@localhost:5432/iskcon_juhu_db
PGHOST=localhost
PGPORT=5432
PGDATABASE=iskcon_juhu_db
PGUSER=iskcon_admin
PGPASSWORD=$DB_PASSWORD

# JWT Secret (CHANGE THIS)
JWT_SECRET=your_very_secure_jwt_secret_here_min_32_chars

# Session Secret (CHANGE THIS)
SESSION_SECRET=your_very_secure_session_secret_here_min_32_chars

# PayU Configuration (Production)
PAYU_MERCHANT_KEY=your_payu_merchant_key
PAYU_MERCHANT_SALT=your_payu_merchant_salt
PAYU_BASE_URL=https://secure.payu.in/_payment

# Twilio Configuration (for WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Application URLs
APP_URL=https://$DOMAIN_NAME
FRONTEND_URL=https://$DOMAIN_NAME
EOF

# Create PM2 ecosystem file
print_status "Creating PM2 ecosystem file..."
cat > /var/www/iskcon-juhu/ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'iskcon-juhu',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/iskcon-juhu',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/iskcon-juhu/err.log',
    out_file: '/var/log/iskcon-juhu/out.log',
    log_file: '/var/log/iskcon-juhu/combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
};
EOF

# Create backup script
print_status "Creating backup script..."
sudo tee /usr/local/bin/backup-iskcon.sh > /dev/null <<EOF
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/iskcon-juhu"
DB_NAME="iskcon_juhu_db"
DB_USER="iskcon_admin"
APP_DIR="/var/www/iskcon-juhu"
DATE=\$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p \$BACKUP_DIR

# Database backup
PGPASSWORD="$DB_PASSWORD" pg_dump -h localhost -U \$DB_USER \$DB_NAME > "\$BACKUP_DIR/db_backup_\$DATE.sql"

# Application files backup
tar -czf "\$BACKUP_DIR/app_backup_\$DATE.tar.gz" -C \$APP_DIR .

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed at \$(date)"
EOF

sudo chmod +x /usr/local/bin/backup-iskcon.sh

# Add backup to crontab
print_status "Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-iskcon.sh >> /var/log/iskcon-backup.log 2>&1") | crontab -

# Create deployment script
print_status "Creating deployment script..."
cat > /var/www/iskcon-juhu/deploy.sh <<EOF
#!/bin/bash

# ISKCON Juhu Deployment Script
cd /var/www/iskcon-juhu

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Running database migrations..."
npm run db:push

echo "Restarting application..."
pm2 restart iskcon-juhu

echo "Deployment completed!"
EOF

chmod +x /var/www/iskcon-juhu/deploy.sh

print_status "Installation completed successfully!"
print_status "Your server is now ready for the ISKCON Juhu Donation System."
print_status ""
print_status "Next steps:"
print_status "1. Upload your application files to /var/www/iskcon-juhu/"
print_status "2. Copy .env.template to .env and fill in your API keys"
print_status "3. Run: cd /var/www/iskcon-juhu && ./deploy.sh"
print_status "4. Start the application: pm2 start ecosystem.config.js"
print_status "5. Visit your website: https://$DOMAIN_NAME"
print_status ""
print_status "Important files:"
print_status "- Application directory: /var/www/iskcon-juhu/"
print_status "- Environment file: /var/www/iskcon-juhu/.env"
print_status "- Nginx config: /etc/nginx/sites-available/iskcon-juhu"
print_status "- PM2 config: /var/www/iskcon-juhu/ecosystem.config.js"
print_status "- Backup script: /usr/local/bin/backup-iskcon.sh"
print_status ""
print_status "Useful commands:"
print_status "- Check PM2 status: pm2 status"
print_status "- View logs: pm2 logs iskcon-juhu"
print_status "- Restart app: pm2 restart iskcon-juhu"
print_status "- Check Nginx: sudo systemctl status nginx"
print_status "- Check PostgreSQL: sudo systemctl status postgresql"
print_status ""
print_warning "Remember to:"
print_warning "- Change the JWT_SECRET and SESSION_SECRET in .env file"
print_warning "- Add your PayU, Twilio, and email credentials"
print_warning "- Test the application thoroughly before going live"
print_warning "- Keep your system updated with: sudo apt update && sudo apt upgrade"
EOF
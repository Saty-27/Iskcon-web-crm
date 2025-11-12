# VPS Deployment Checklist

## Pre-Deployment Checklist

### ✅ Server Setup
- [ ] VPS server with Ubuntu 20.04+ or CentOS 7+
- [ ] Root/sudo access configured
- [ ] Domain name pointing to server IP
- [ ] Node.js 20+ installed
- [ ] PM2 process manager installed
- [ ] Nginx web server installed

### ✅ Database Setup
- [ ] PostgreSQL database created
- [ ] Database user and permissions configured
- [ ] Database connection string ready
- [ ] Database migrations tested

### ✅ Environment Configuration
- [ ] .env file created with production values
- [ ] PayU live credentials configured
- [ ] UPI payment details updated
- [ ] Twilio WhatsApp credentials added
- [ ] Session secret generated
- [ ] SSL certificate obtained

### ✅ Application Build
- [ ] Dependencies installed (`npm install`)
- [ ] Application built (`npm run build`)
- [ ] Upload directories created
- [ ] File permissions set correctly

## Deployment Steps

### 1. Upload Project Files
```bash
# Option A: Using Git
git clone https://github.com/yourusername/iskcon-juhu-donation.git /var/www/iskcon-juhu

# Option B: Using SCP
scp -r /path/to/project/* user@server-ip:/var/www/iskcon-juhu/
```

### 2. Install Dependencies
```bash
cd /var/www/iskcon-juhu
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env
# Add production environment variables
```

### 4. Build Application
```bash
npm run build
```

### 5. Database Setup
```bash
npm run db:push
```

### 6. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/iskcon-juhu
sudo ln -s /etc/nginx/sites-available/iskcon-juhu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Start Application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Configure Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Post-Deployment Verification

### ✅ Application Status
- [ ] PM2 process running (`pm2 status`)
- [ ] Application responding on port 5000
- [ ] Database connection working
- [ ] File uploads working

### ✅ Web Server
- [ ] Nginx configuration valid (`sudo nginx -t`)
- [ ] SSL certificate installed and working
- [ ] Domain redirecting HTTP to HTTPS
- [ ] Static files serving correctly

### ✅ Security
- [ ] Firewall configured and enabled
- [ ] SSL certificate auto-renewal set up
- [ ] File permissions secure
- [ ] Environment variables protected

### ✅ Monitoring
- [ ] PM2 monitoring active
- [ ] Log files accessible
- [ ] Database backup script configured
- [ ] SSL certificate expiry monitoring

## Production Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/iskcon_juhu

# PayU (LIVE)
PAYU_MERCHANT_KEY=your_live_payu_key
PAYU_MERCHANT_SALT=your_live_payu_salt
PAYU_BASE_URL=https://secure.payu.in

# UPI
UPI_ID=iskconjuhu@sbi

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# App
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_very_secure_session_secret_here
```

## Quick Commands

### Start/Stop Application
```bash
pm2 start iskcon-juhu
pm2 stop iskcon-juhu
pm2 restart iskcon-juhu
pm2 reload iskcon-juhu
```

### Check Logs
```bash
pm2 logs iskcon-juhu
pm2 logs iskcon-juhu --lines 100
```

### Monitor Application
```bash
pm2 monit
pm2 status
```

### Nginx Commands
```bash
sudo nginx -t                    # Test configuration
sudo systemctl reload nginx     # Reload configuration
sudo systemctl restart nginx    # Restart nginx
sudo systemctl status nginx     # Check status
```

### Database Backup
```bash
pg_dump -h localhost -U iskcon_user iskcon_juhu > backup.sql
```

## Troubleshooting

### Common Issues
1. **Port 5000 in use**: `sudo lsof -i :5000` and kill the process
2. **Database connection failed**: Check DATABASE_URL and PostgreSQL status
3. **File upload issues**: Check uploads directory permissions
4. **SSL certificate errors**: Verify certificate paths in nginx config

### Important Log Files
- Application: `pm2 logs iskcon-juhu`
- Nginx Access: `/var/log/nginx/access.log`
- Nginx Error: `/var/log/nginx/error.log`
- System: `/var/log/syslog`

## Maintenance Schedule

### Daily
- [ ] Check application status
- [ ] Monitor error logs

### Weekly
- [ ] Review security logs
- [ ] Check disk space
- [ ] Test backup restoration

### Monthly
- [ ] Update dependencies
- [ ] Review SSL certificate status
- [ ] Clean old log files
- [ ] Security updates
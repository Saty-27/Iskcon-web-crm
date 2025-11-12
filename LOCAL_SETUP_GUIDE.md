# ISKCON Juhu Donation System - Local Setup Guide

## Prerequisites

Make sure you have these installed on your local machine:
- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** (version 14 or higher)

## Step 1: Download the Project

1. Download all project files from this Replit workspace
2. Create a new folder on your computer (e.g., `iskcon-juhu-website`)
3. Extract all files into this folder

## Step 2: Install Dependencies

Open terminal/command prompt in your project folder and run:

```bash
npm install
```

## Step 3: Database Setup

### Create PostgreSQL Database

1. Start PostgreSQL service on your machine
2. Create a new database:

```sql
CREATE DATABASE iskcon_juhu;
CREATE USER iskcon_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE iskcon_juhu TO iskcon_user;
```

### Environment Variables

Create a `.env` file in your project root with these variables:

```env
# Database Configuration
DATABASE_URL=postgresql://iskcon_user:your_secure_password@localhost:5432/iskcon_juhu

# PayU Payment Gateway (LIVE)
PAYU_MERCHANT_KEY=2fKjPt
PAYU_MERCHANT_SALT=your_actual_salt_from_payu

# Email Configuration (for PDF receipts)
EMAIL_USER=donations@iskconjuhu.org
EMAIL_PASSWORD=your_app_specific_password

# Twilio (for WhatsApp notifications)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_whatsapp_business_number

# Session Secret
SESSION_SECRET=your_very_secure_random_string_here
```

## Step 4: Initialize Database

Run the database migration:

```bash
npm run db:push
```

## Step 5: Start the Application

```bash
npm run dev
```

The application will be available at: `http://localhost:5000`

## Step 6: Admin Access

Default admin credentials:
- Username: `iskconadmin`
- Password: `iskcon123`

Access admin panel at: `http://localhost:5000/login`

## Production Configuration

### PayU Live Configuration

1. Get your live merchant credentials from PayU dashboard
2. Update these in your `.env` file:
   - `PAYU_MERCHANT_KEY` (starts with your actual key)
   - `PAYU_MERCHANT_SALT` (your actual salt)

### Email Setup (Gmail)

1. Enable 2-factor authentication on Gmail
2. Generate app-specific password at: https://myaccount.google.com/apppasswords
3. Use this app password in `EMAIL_PASSWORD`

### WhatsApp Setup (Twilio)

1. Sign up for Twilio WhatsApp Business API
2. Get verified WhatsApp Business number
3. Update Twilio credentials in `.env`

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong database password
- [ ] Generate secure SESSION_SECRET (32+ characters)
- [ ] Keep all API keys and credentials secure
- [ ] Never commit `.env` file to version control

## Features Included

### Payment System
- Live PayU integration with UPI, Cards, Net Banking
- Real-time payment processing
- Automatic receipt generation

### Receipt System
- PDF receipt generation with ISKCON branding
- Email delivery with tax deduction information
- WhatsApp notifications via Twilio

### Admin Panel
- Content management for banners, events, gallery
- Donation tracking and analytics
- User management system

### Public Features
- Responsive website design
- Multiple donation categories
- Event management
- Photo and video galleries

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U iskcon_user -d iskcon_juhu
```

### Port Already in Use
If port 5000 is busy, the app will automatically use the next available port.

### Missing Dependencies
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Support

For technical issues:
1. Check console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure database is running and accessible
4. Confirm all API keys are valid and active

## File Structure

```
iskcon-juhu-website/
├── client/              # Frontend React application
├── server/              # Backend Express server
├── shared/              # Shared types and schemas
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables (create this)
├── drizzle.config.ts    # Database configuration
└── README.md           # This file
```

## Next Steps

1. Test donation flow with small amounts
2. Verify email and WhatsApp notifications work
3. Customize content through admin panel
4. Add your actual images and content
5. Set up domain and SSL certificate for production

The system is production-ready with live payment processing, PDF receipts, and WhatsApp notifications!
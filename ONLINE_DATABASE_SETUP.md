# ISKCON Juhu - Online Database Setup Guide

## Using Your Neon Database

You already have a Neon database configured! Here's how to use it directly:

### Step 1: Environment Configuration

Create your `.env` file with your Neon database URL:

```env
# Neon Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_tklxNS9c3Loz@ep-purple-mouse-a52hn3mv.us-east-2.aws.neon.tech/neondb?sslmode=require

# PayU Payment Gateway - LIVE PRODUCTION
PAYU_MERCHANT_KEY=2fKjPt
PAYU_MERCHANT_SALT=zBqitHlab9VU52l9ZDv8x5D1rxYBtgat

# Email Configuration for PDF Receipts
EMAIL_USER=donations@iskconjuhu.org
EMAIL_PASSWORD=your_gmail_app_specific_password

# Twilio WhatsApp Business API
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_whatsapp_business_number

# Session Security
SESSION_SECRET=iskcon_juhu_secure_session_key_2024_very_long_string_for_security

# Application Settings
NODE_ENV=production
PORT=5000
```

### Step 2: Initialize Database Tables

Run this command to create all tables in your Neon database:

```bash
npm run db:push
```

This will automatically create all the tables (users, donations, banners, events, etc.) in your online Neon database.

### Step 3: Start Application

```bash
npm run dev
```

Your application will connect directly to the Neon database online - no local PostgreSQL needed!

### Step 4: Access Your System

- **Website**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/login
- **Default Admin**: username `iskconadmin`, password `iskcon123`

## What You Get

✅ **Live Payment Processing** - Real PayU integration with UPI, cards, net banking
✅ **Online Database** - All data stored in Neon cloud database
✅ **PDF Receipts** - Automatic receipt generation with ISKCON branding
✅ **Email Delivery** - Receipts sent via email (when EMAIL_PASSWORD is configured)
✅ **WhatsApp Notifications** - Payment confirmations via Twilio (when configured)
✅ **Admin Management** - Complete content and donation management system

## No Local Setup Required

- ❌ No PostgreSQL installation needed
- ❌ No local database setup required
- ❌ No SQL imports needed
- ✅ Just download the project files and run with your online database

## Database Connection Details

Your Neon database:
- **Host**: ep-purple-mouse-a52hn3mv.us-east-2.aws.neon.tech
- **Database**: neondb
- **User**: neondb_owner
- **SSL**: Required (automatically handled)

The system will automatically create all required tables when you run `npm run db:push`.

## Ready for Production

Your system is configured for:
- Live payments with PayU gateway
- Professional tax-deductible receipts
- Real donation processing
- Complete admin panel functionality

Just download the project files, add the `.env` configuration above, and run the commands!
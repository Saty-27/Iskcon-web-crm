# ISKCON Juhu Website - Local Setup Guide

## Prerequisites

1. **Node.js** (version 18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)

2. **PostgreSQL** (version 12 or higher)
   - Download from [postgresql.org](https://www.postgresql.org/download/)

## Step 1: Clone and Install Dependencies

1. Download or clone the project files to your PC
2. Open terminal in the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Step 2: Set Up PostgreSQL Database

1. Create a new PostgreSQL database:
   ```sql
   CREATE DATABASE iskconjuhu;
   ```

2. Note your PostgreSQL connection details:
   - Host (usually `localhost`)
   - Port (usually `5432`)
   - Username and password
   - Database name (`iskconjuhu`)

## Step 3: Configure Environment Variables

Create a `.env` file in the project root with these variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/iskconjuhu
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=iskconjuhu

# PayU Payment Gateway
PAYU_MERCHANT_KEY=your_payu_merchant_key
PAYU_MERCHANT_SALT=your_payu_merchant_salt

# Twilio WhatsApp Notifications
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_whatsapp_number

# Session Secret (generate a random string)
SESSION_SECRET=your_random_session_secret_here
```

## Step 4: Initialize Database

1. Run the database migrations to create all tables:
   ```bash
   npm run db:push
   ```

2. The application will automatically create a default admin user:
   - Username: `iskconadmin`
   - Password: `iskcon123`

## Step 5: Start the Application

```bash
npm run dev
```

The application will be available at: `http://localhost:5000`

## Features Included

### For Visitors:
- Browse temple information, events, and gallery
- Make donations via PayU or UPI
- Receive WhatsApp receipts for successful donations
- Get WhatsApp notifications for failed payments
- Contact form submission

### For Admins:
- Content management (banners, events, gallery, videos)
- Donation tracking and statistics
- User management
- View contact messages

## Payment Gateway Setup

### PayU Configuration:
1. Create a PayU merchant account
2. Get your Merchant Key and Salt from PayU dashboard
3. Add them to your `.env` file

### UPI Configuration:
- The system uses `iskconjuhu@sbi` as the default UPI ID
- QR codes are generated automatically for desktop users
- Mobile users get direct app redirection

### WhatsApp Notifications:
1. Set up a Twilio account
2. Enable WhatsApp Business API
3. Configure your WhatsApp sandbox for testing
4. Add Twilio credentials to `.env` file

## Testing the System

1. **User Registration**: Create a test user account
2. **Donation Flow**: Test both PayU and UPI payment methods
3. **Admin Panel**: Login with admin credentials to manage content
4. **WhatsApp**: Test notifications with your phone number

## Troubleshooting

### Database Connection Issues:
- Verify PostgreSQL is running
- Check connection string format
- Ensure database exists and user has permissions

### Payment Issues:
- For testing, use PayU test credentials
- UPI payments can be simulated in development mode

### WhatsApp Issues:
- Ensure phone numbers include country code (+91 for India)
- Verify Twilio WhatsApp sandbox is active
- Check that recipient has joined your WhatsApp sandbox

## Production Deployment

For production deployment:
1. Use a production PostgreSQL database
2. Update environment variables with production values
3. Enable HTTPS for secure payment processing
4. Configure proper session storage for scalability

## Support

The system includes comprehensive error handling and logging. Check console logs for debugging information.
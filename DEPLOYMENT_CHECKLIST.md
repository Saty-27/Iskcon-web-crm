# Local Deployment Checklist

## Quick Setup Steps

1. **Download Project Files**
   - Copy all files from this Replit workspace to your local machine
   - Ensure you have the complete folder structure

2. **Install Prerequisites**
   ```bash
   # Check if Node.js is installed
   node --version  # Should be 18+
   npm --version
   
   # Check if PostgreSQL is installed
   psql --version  # Should be 14+
   ```

3. **Database Setup**
   ```sql
   -- Connect to PostgreSQL as admin
   CREATE DATABASE iskcon_juhu;
   CREATE USER iskcon_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE iskcon_juhu TO iskcon_user;
   ```

4. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your actual values
   nano .env  # or use any text editor
   ```

5. **Install Dependencies**
   ```bash
   npm install
   ```

6. **Initialize Database**
   ```bash
   npm run db:push
   ```

7. **Start Application**
   ```bash
   npm run dev
   ```

## Live Payment Configuration

### PayU Setup
1. Log into PayU merchant dashboard
2. Get your live credentials:
   - Merchant Key (starts with your actual key)
   - Merchant Salt (hash value)
3. Update `.env` file with these credentials

### Email Configuration
1. Use Gmail with 2-factor authentication
2. Generate app password at: myaccount.google.com/apppasswords
3. Add credentials to `.env`

### WhatsApp Integration
1. Sign up for Twilio WhatsApp Business API
2. Get verified business number
3. Add Twilio credentials to `.env`

## Security Configuration

- Change default admin password immediately
- Use strong database credentials
- Generate secure session secret (32+ characters)
- Never share or commit `.env` file

## Testing the System

1. **Test basic functionality**
   - Access website at `http://localhost:5000`
   - Login to admin at `/login`
   - Check all pages load correctly

2. **Test donation flow**
   - Select donation category
   - Fill donation form
   - Complete payment process
   - Verify receipt generation

3. **Test admin features**
   - Manage donation categories
   - View donation analytics
   - Update website content

## Production Considerations

- Set up SSL certificate for HTTPS
- Configure domain name
- Set up regular database backups
- Monitor payment transactions
- Keep API credentials secure

## Support Information

**Default Admin Access:**
- Username: iskconadmin
- Password: iskcon123 (change immediately)

**Key Features:**
- Live PayU payment processing
- PDF receipt generation
- WhatsApp notifications
- Complete admin panel
- Responsive design

The system is production-ready with all payment integrations configured for live transactions.
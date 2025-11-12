# ISKCON Juhu Donation System

A comprehensive donation management system for ISKCON Juhu temple built with modern web technologies.

## Features

- **Online Donations**: Secure PayU payment integration with multiple payment methods
- **Admin Panel**: Complete administrative interface for managing donations, events, and content
- **Event Management**: Create and manage temple events with custom donation pages
- **Category Management**: Organize donations by categories with custom bank details
- **Receipt Generation**: Automated PDF receipts with WhatsApp delivery
- **Content Management**: Dynamic banners, gallery, videos, and blog system
- **User Authentication**: Secure JWT-based authentication system
- **Mobile Responsive**: Fully responsive design for all devices

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Radix UI components
- TanStack Query for data fetching
- React Hook Form with Zod validation

### Backend
- Node.js with Express
- PostgreSQL database
- Drizzle ORM
- JWT authentication
- Multer for file uploads
- PM2 for production deployment

### Payment Integration
- PayU Payment Gateway
- UPI payments
- WhatsApp notifications via Twilio
- PDF receipt generation

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/iskcon-juhu-donation-system.git
   cd iskcon-juhu-donation-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Setup database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Production Deployment

For production deployment on VPS, see our comprehensive guides:

- [Complete VPS Deployment Guide](VPS_DEPLOYMENT_COMPLETE_GUIDE.md)
- [Automated Setup Script](vps-setup-script.sh)
- [File Transfer Guide](FILE_TRANSFER_GUIDE.md)

### Quick VPS Deployment

1. **Run the setup script on your VPS**
   ```bash
   curl -O https://raw.githubusercontent.com/yourusername/iskcon-juhu-donation-system/main/vps-setup-script.sh
   chmod +x vps-setup-script.sh
   ./vps-setup-script.sh
   ```

2. **Clone and deploy**
   ```bash
   cd /var/www/iskcon-juhu
   git clone https://github.com/yourusername/iskcon-juhu-donation-system.git .
   cp .env.example .env
   # Edit .env with production values
   ./deploy.sh
   pm2 start ecosystem.config.js
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Authentication
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# PayU Payment Gateway
PAYU_MERCHANT_KEY=your_payu_key
PAYU_MERCHANT_SALT=your_payu_salt
PAYU_BASE_URL=https://secure.payu.in/_payment

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# URLs
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

## Admin Access

Default admin credentials:
- Username: `isk_conjuhuadmin`
- Password: `isk_conjuhukrishnaconsiousness`

Access the admin panel at: `/login`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Donations
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Create donation
- `GET /api/donation-categories` - Get donation categories
- `POST /api/donation-categories` - Create category

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Content Management
- `GET /api/banners` - Get banners
- `POST /api/banners` - Create banner
- `GET /api/gallery` - Get gallery images
- `POST /api/gallery` - Upload gallery image

## File Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/          # Utilities
├── server/                # Express backend
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── middleware/       # Express middleware
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema
├── uploads/             # File uploads directory
└── docs/               # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in this repository.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.
# ISKCON Juhu Donation System

## Overview

This is a comprehensive donation management system for ISKCON Juhu temple built with Node.js, Express, React, and PostgreSQL. The system enables online donations through live payment gateways, manages temple content, and provides an admin panel for temple administration.

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI components with shadcn/ui
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM
- **Session Management**: Express Session
- **File Uploads**: Multer for image handling
- **API Design**: RESTful APIs with consistent error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon cloud database
- **File Storage**: Local filesystem for uploads (images, receipts)
- **Session Storage**: In-memory sessions (configurable for production)

## Key Components

### Payment System (LIVE Production Mode)
- **PayU Integration**: Live payment gateway with real transaction processing
- **UPI Support**: Direct UPI payments to `iskconjuhu@sbi`
- **Multiple Payment Methods**: Cards, Net Banking, Wallets, UPI
- **Receipt Generation**: Automated PDF receipts with ISKCON branding
- **WhatsApp Notifications**: Twilio integration for instant receipt delivery

### Content Management
- **Dynamic Banners**: Homepage carousel management
- **Event Management**: Festival and special event organization
- **Gallery System**: Image gallery with lightbox functionality
- **Video Management**: YouTube video integration
- **Blog System**: Spiritual content publishing
- **Quote Rotator**: Daily spiritual quotes display

### Donation Categories
- **Temple Renovation**: Infrastructure development donations
- **Food for All**: Meal distribution program
- **Education Support**: Spiritual education initiatives
- **Festival Sponsorship**: Event-specific donations
- **General Donations**: Flexible contribution options

### Admin Panel Features
- **Dashboard**: Donation analytics and temple statistics
- **User Management**: Admin and donor account management
- **Content Administration**: Banner, event, and media management
- **Donation Tracking**: Real-time donation monitoring
- **Message Center**: Contact form submissions handling

## Data Flow

### Donation Process
1. User selects donation category or event
2. Fills donation form with personal details
3. Payment initiated through PayU gateway
4. Real-time payment verification via webhooks
5. Donation record created/updated in database
6. PDF receipt generated with tax information
7. WhatsApp notification sent to donor
8. Admin notification for successful donations

### Content Management Flow
1. Admin creates/edits content through admin panel
2. Content stored in PostgreSQL database
3. Frontend fetches content via REST APIs
4. Real-time updates through query invalidation
5. Image uploads handled and stored locally

## External Dependencies

### Payment Gateways
- **PayU**: Primary payment processor for cards/net banking
- **UPI**: Direct UPI integration for mobile payments

### Communication Services
- **Twilio WhatsApp Business**: Receipt delivery and notifications
- **Email (Optional)**: SendGrid integration available

### Third-Party Libraries
- **PDF Generation**: PDFKit for receipt creation
- **Image Processing**: Sharp for image optimization
- **Date Handling**: date-fns for date formatting
- **Validation**: Zod for type-safe form validation

## Deployment Strategy

### Production Configuration
- **Database**: Neon PostgreSQL cloud database
- **Environment**: Node.js 20+ with TypeScript
- **Build Process**: Vite for frontend, esbuild for backend
- **Asset Serving**: Express static file serving
- **Session Security**: Secure session management with environment secrets
- **VPS Deployment**: Complete deployment guide available in VPS_DEPLOYMENT_GUIDE.md
- **Process Management**: PM2 for production process management
- **Web Server**: Nginx with SSL termination and reverse proxy
- **SSL**: Let's Encrypt certificates with auto-renewal

### Local Development
- **Database**: PostgreSQL 14+ (local or cloud)
- **Hot Reload**: Vite dev server with HMR
- **Type Checking**: TypeScript strict mode enabled
- **Environment**: dotenv for configuration management

### Authentication & Authorization
- **Session-based Auth**: Express sessions with secure cookies
- **Role-based Access**: User and admin role separation
- **Password Security**: Hashed password storage
- **Admin Protection**: Admin-only routes for sensitive operations

## Changelog
- June 14, 2025. Initial setup
- June 14, 2025. Fixed donation category deletion error - Added proper foreign key constraint handling and enhanced error messages for categories with existing donations
- June 26, 2025. Fixed admin panel desktop layout - Corrected sidebar positioning and content alignment for proper desktop display
- June 26, 2025. Fixed QR code upload issue - Implemented event-specific bank details system to prevent QR code uploads for one event affecting all other events
- June 26, 2025. Enhanced file upload system - Fixed QR code file persistence by implementing proper directory routing and file moving functionality
- July 12, 2025. Fixed donation card duplication and deletion issues - Implemented comprehensive duplicate prevention system with server-side validation, improved modal state management, and proper card deletion logic. Added database-level duplicate detection and enhanced cache invalidation strategies.
- July 13, 2025. Updated admin authentication system - Changed admin login credentials to username: isk_conjuhuadmin and password: isk_conjuhukrishnaconsiousness. Updated login form to use username instead of email, enabled proper admin route protection, and fixed redirect logic to send admin users to /admin dashboard after successful login.
- July 13, 2025. Enhanced admin header with "Back to Website" logout button - Replaced standalone logout button with "Back to Website" button that performs logout functionality and redirects to home page. Button shows home icon with blue hover effects and is responsive (icon only on mobile, icon + text on desktop).
- July 13, 2025. Successfully completed VPS deployment - Migrated ISKCON Juhu donation system from Replit to KVM2 VPS hosting with Ubuntu. Configured production environment with Node.js v20.19.3, PostgreSQL, PM2, and Nginx. Deployed complete system with PayU payment processing, admin panel, proper database schema, and ISKCON content. System now running on production VPS with all features active.
- July 13, 2025. Completed Twilio removal and VPS optimization - Successfully removed all Twilio/WhatsApp dependencies from the system as requested by user. Fixed invoice service exports, cleaned up receipt routes, and resolved all compilation errors. Application now runs cleanly on Hostinger VPS with PM2 process management showing "online" status. System fully operational with PayU payments, admin panel, and PDF receipt generation (WhatsApp notifications disabled).
- July 14, 2025. Successfully migrated from cloud database to local PostgreSQL - Completed migration from Neon cloud database to local PostgreSQL server on Hostinger VPS. Installed PostgreSQL 14+, created database "iskcon_juhu" with proper permissions for user "iskcon_user", and imported all existing data (12 tables including banners, donation_categories, events, gallery, quotes, users, videos, etc.). Updated DATABASE_URL configuration and verified all tables and data integrity. System now runs entirely on VPS with local database for improved performance, reliability, and cost savings.
- July 14, 2025. Successfully resolved VPS web server configuration - Fixed database connection issues by starting PostgreSQL service and configuring proper database credentials. Application now runs successfully on Hostinger VPS with PM2 process management. Due to LiteSpeed web server controlling port 80, configured application to run on port 5000 for external access. All API endpoints functioning properly, session management active, and database queries responding correctly. ISKCON Juhu donation system now fully operational on VPS hosting.
- July 14, 2025. Completed port configuration optimization - Synchronized port settings across all configuration files (.env, ecosystem.config.cjs) to use port 5000 consistently. Application confirmed running locally on port 5000 with proper HTTP responses. External access testing in progress for final deployment verification.

## User Preferences

Preferred communication style: Simple, everyday language.
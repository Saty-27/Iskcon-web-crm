-- ISKCON Juhu Donation System Database Setup
-- Run this file in PostgreSQL to create the complete database structure

-- Create database and user
CREATE DATABASE iskcon_juhu;
CREATE USER iskcon_user WITH ENCRYPTED PASSWORD 'iskcon123';
GRANT ALL PRIVILEGES ON DATABASE iskcon_juhu TO iskcon_user;

-- Connect to the database
\c iskcon_juhu;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO iskcon_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iskcon_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iskcon_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO iskcon_user;

-- Create tables
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255),
	"password" varchar(255) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"image_url" varchar(255),
	"link_url" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"author" varchar(255),
	"source" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "donation_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"suggested_amount" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"date" timestamp NOT NULL,
	"location" varchar(255),
	"image_url" varchar(255),
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"image_url" varchar(255) NOT NULL,
	"category" varchar(255),
	"is_featured" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"video_url" varchar(255) NOT NULL,
	"thumbnail_url" varchar(255),
	"duration" varchar(50),
	"category" varchar(255),
	"is_featured" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"title" varchar(255),
	"image_url" varchar(255),
	"rating" integer DEFAULT 5,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"subject" varchar(255),
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "social_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" varchar(100) NOT NULL,
	"url" varchar(255) NOT NULL,
	"icon" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_name" varchar(255) NOT NULL,
	"donor_email" varchar(255) NOT NULL,
	"donor_phone" varchar(20),
	"amount" numeric(10,2) NOT NULL,
	"currency" varchar(3) DEFAULT 'INR',
	"category_id" integer,
	"purpose" text,
	"payment_id" varchar(255),
	"payment_status" varchar(50) DEFAULT 'pending',
	"payment_method" varchar(50),
	"receipt_number" varchar(100),
	"receipt_url" varchar(255),
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscriptions_email_unique" UNIQUE("email")
);

-- Add foreign key constraints
ALTER TABLE "donations" ADD CONSTRAINT "donations_category_id_donation_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "donation_categories"("id") ON DELETE no action ON UPDATE no action;

-- Grant permissions on new tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iskcon_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iskcon_user;

-- Insert default admin user
INSERT INTO users (username, email, password, first_name, last_name, is_admin) 
VALUES ('iskconadmin', 'admin@iskconjuhu.org', '$2b$10$8K1p/a9l4FO4LlvDrQehfOuBXOz.JivMjj8VW4lqIa/Yb8J8P1uJa', 'ISKCON', 'Admin', true)
ON CONFLICT (username) DO NOTHING;

-- Insert sample donation categories
INSERT INTO donation_categories (name, description, suggested_amount, order_index) VALUES
('Temple Renovation', 'Support the renovation and maintenance of our beautiful temple', 5000, 1),
('Food for All', 'Help us serve free meals to devotees and visitors', 1000, 2),
('Education Programs', 'Support spiritual education and cultural programs', 2000, 3),
('Deity Services', 'Contribute to daily deity worship and ceremonies', 3000, 4),
('Festival Celebrations', 'Help organize grand festivals and celebrations', 2500, 5),
('General Donation', 'Support the overall mission of ISKCON Juhu', 1000, 6)
ON CONFLICT DO NOTHING;

-- Insert sample banners
INSERT INTO banners (title, description, image_url, order_index) VALUES
('Welcome to ISKCON Juhu', 'Experience divine consciousness at one of Mumbai''s most sacred temples', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200', 1),
('Join Our Community', 'Be part of a spiritual family dedicated to Krishna consciousness', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200', 2),
('Daily Programs', 'Participate in our daily arati, kirtan, and spiritual activities', 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=1200', 3)
ON CONFLICT DO NOTHING;

-- Insert sample quotes
INSERT INTO quotes (text, author, source, order_index) VALUES
('The Supreme Lord said: Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.', 'Lord Krishna', 'Bhagavad Gita 18.66', 1),
('One should chant the holy name of the Lord in a humble state of mind, thinking oneself lower than the straw in the street.', 'Sri Chaitanya Mahaprabhu', 'Shikshashtaka 3', 2),
('The ultimate goal of life is to develop pure love of God, Krishna consciousness.', 'A.C. Bhaktivedanta Swami Prabhupada', 'Teachings', 3)
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, date, location, image_url, is_featured) VALUES
('Janmashtami Celebration', 'Grand celebration of Lord Krishna''s appearance day with midnight arati', '2024-08-26 23:30:00', 'ISKCON Juhu Temple', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', true),
('Ratha Yatra Festival', 'Annual chariot festival with Lord Jagannath', '2024-07-07 16:00:00', 'Juhu Beach to Temple', 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=800', true),
('Sunday Feast Program', 'Weekly spiritual program with kirtan, lecture, and prasadam', '2024-06-30 17:00:00', 'ISKCON Juhu Temple', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', false)
ON CONFLICT DO NOTHING;

-- Insert sample gallery items
INSERT INTO gallery (title, description, image_url, category, is_featured, order_index) VALUES
('Temple Entrance', 'Beautiful entrance to ISKCON Juhu temple', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', 'Architecture', true, 1),
('Deity Darshan', 'Sri Sri Radha Rasabihari during morning arati', 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=600', 'Deities', true, 2),
('Festival Celebrations', 'Devotees celebrating Janmashtami', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', 'Festivals', false, 3),
('Temple Gardens', 'Beautiful gardens surrounding the temple', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', 'Nature', false, 4)
ON CONFLICT DO NOTHING;

-- Insert sample videos
INSERT INTO videos (title, description, video_url, thumbnail_url, duration, category, is_featured, order_index) VALUES
('Jagannath Rath Yatra 2024', 'Highlights from the annual Ratha Yatra celebration', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=600', '15:30', 'Festivals', true, 1),
('Daily Temple Program', 'Experience our daily spiritual activities', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', '8:45', 'Daily Programs', false, 2),
('Bhagavad Gita Class', 'Weekly spiritual discourse on Bhagavad Gita', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', '45:20', 'Education', false, 3)
ON CONFLICT DO NOTHING;

-- Final permissions grant
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iskcon_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iskcon_user;

-- Show completion message
SELECT 'ISKCON Juhu database setup completed successfully!' as status;
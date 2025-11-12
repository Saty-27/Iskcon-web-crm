--
-- PostgreSQL database dump for ISKCON Juhu Donation System
-- Import this file directly into PostgreSQL
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Create database and user
--
CREATE DATABASE iskcon_juhu WITH TEMPLATE = template0 ENCODING = 'UTF8';
ALTER DATABASE iskcon_juhu OWNER TO postgres;

-- Connect to the database
\connect iskcon_juhu

-- Create user
CREATE ROLE iskcon_user WITH LOGIN PASSWORD 'iskcon123';
GRANT ALL PRIVILEGES ON DATABASE iskcon_juhu TO iskcon_user;
GRANT ALL ON SCHEMA public TO iskcon_user;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--
CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;

SET default_tablespace = '';
SET default_table_access_method = heap;

--
-- Name: banners; Type: TABLE; Schema: public; Owner: iskcon_user
--
CREATE TABLE public.banners (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    image_url character varying(255),
    link_url character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
ALTER TABLE public.banners OWNER TO iskcon_user;

--
-- Name: banners_id_seq; Type: SEQUENCE; Schema: public; Owner: iskcon_user
--
CREATE SEQUENCE public.banners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.banners_id_seq OWNER TO iskcon_user;
ALTER SEQUENCE public.banners_id_seq OWNED BY public.banners.id;

--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: iskcon_user
--
CREATE TABLE public.contact_messages (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    subject character varying(255),
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
ALTER TABLE public.contact_messages OWNER TO iskcon_user;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: iskcon_user
--
CREATE SEQUENCE public.contact_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.contact_messages_id_seq OWNER TO iskcon_user;
ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;

--
-- Name: donation_categories; Type: TABLE; Schema: public; Owner: iskcon_user
--
CREATE TABLE public.donation_categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    suggested_amount integer,
    is_active boolean DEFAULT true NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
ALTER TABLE public.donation_categories OWNER TO iskcon_user;

--
-- Name: donation_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: iskcon_user
--
CREATE SEQUENCE public.donation_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.donation_categories_id_seq OWNER TO iskcon_user;
ALTER SEQUENCE public.donation_categories_id_seq OWNED BY public.donation_categories.id;

--
-- Name: donations; Type: TABLE; Schema: public; Owner: iskcon_user
--
CREATE TABLE public.donations (
    id integer NOT NULL,
    donor_name character varying(255) NOT NULL,
    donor_email character varying(255) NOT NULL,
    donor_phone character varying(20),
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'INR'::character varying,
    category_id integer,
    purpose text,
    payment_id character varying(255),
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    payment_method character varying(50),
    receipt_number character varying(100),
    receipt_url character varying(255),
    is_anonymous boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
ALTER TABLE public.donations OWNER TO iskcon_user;

--
-- Name: donations_id_seq; Type: SEQUENCE; Schema: public; Owner: iskcon_user
--
CREATE SEQUENCE public.donations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.donations_id_seq OWNER TO iskcon_user;
ALTER SEQUENCE public.donations_id_seq OWNED BY public.donations.id;

--
-- Name: events; Type: TABLE; Schema: public; Owner: iskcon_user
--
CREATE TABLE public.events (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    date timestamp without time zone NOT NULL,
    location character varying(255),
    image_url character varying(255),
    is_featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
ALTER TABLE public.events OWNER TO iskcon_user;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: iskcon_user
--
CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.events_id_seq OWNER TO iskcon_user;
ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;

--
-- Name: gallery; Type: TABLE; Schema: public; Owner: iskcon_user
--
CREATE TABLE public.gallery (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    image_url character varying(255) NOT NULL,
    category character varying(255),
    is_featured boolean DEFAULT false NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
ALTER TABLE public.gallery OWNER TO iskcon_user;

--
-- Name: gallery_id_seq; Type: SEQUENCE; Schema: public; Owner: iskcon_user
--
CREATE SEQUENCE public.gallery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.gallery_id_seq OWNER TO iskcon_user;
ALTER SEQUENCE public.gallery_id_seq OWNED BY public.gallery.id;

--
-- Name: quotes; Type: TABLE; Schema: public; Owner: iskcon_user
--
CREATE TABLE public.quotes (
    id integer NOT NULL,
    text text NOT NULL,
    author character varying(255),
    source character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
ALTER TABLE public.quotes OWNER TO iskcon_user;

--
-- Name: quotes_id_seq; Type: SEQUENCE; Schema: public; Owner: iskcon_user
--
CREATE SEQUENCE public.quotes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.quotes_id_seq OWNER TO iskcon_user;
ALTER SEQUENCE public.quotes_id_seq OWNED BY public.quotes.id;

--
-- Name: social_links; Type: TABLE; Schema: public; Owner: iskcon_user
--
CREATE TABLE public.social_links (
    id integer NOT NULL,
    platform character varying(100) NOT NULL,
    url character varying(255) NOT NULL,
    icon character varying(100),
    is_active boolean DEFAULT true NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
ALTER TABLE public.social_links OWNER TO iskcon_user;

--
-- Name: social_links_id_seq; Type: SEQUENCE; Schema: public; Owner: iskcon_user
--
CREATE SEQUENCE public.social_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.social_links_id_seq OWNER TO iskcon_user;
ALTER SEQUENCE public.social_links_id_seq OWNED BY public.social_links.id;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: iskcon_user
--
CREATE TABLE public.subscriptions (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
ALTER TABLE public.subscriptions OWNER TO iskcon_user;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: iskcon_user
--
CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.subscriptions_id_seq OWNER TO iskcon_user;
ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;

--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: iskcon_user
--
CREATE TABLE public.testimonials (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content text NOT NULL,
    title character varying(255),
    image_url character varying(255),
    rating integer DEFAULT 5,
    is_featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
ALTER TABLE public.testimonials OWNER TO iskcon_user;

--
-- Name: testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: iskcon_user
--
CREATE SEQUENCE public.testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.testimonials_id_seq OWNER TO iskcon_user;
ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;

--
-- Name: users; Type: TABLE; Schema: public; Owner: iskcon_user
--
CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255),
    password character varying(255) NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    is_admin boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
ALTER TABLE public.users OWNER TO iskcon_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: iskcon_user
--
CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.users_id_seq OWNER TO iskcon_user;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

--
-- Name: videos; Type: TABLE; Schema: public; Owner: iskcon_user
--
CREATE TABLE public.videos (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    video_url character varying(255) NOT NULL,
    thumbnail_url character varying(255),
    duration character varying(50),
    category character varying(255),
    is_featured boolean DEFAULT false NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
ALTER TABLE public.videos OWNER TO iskcon_user;

--
-- Name: videos_id_seq; Type: SEQUENCE; Schema: public; Owner: iskcon_user
--
CREATE SEQUENCE public.videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.videos_id_seq OWNER TO iskcon_user;
ALTER SEQUENCE public.videos_id_seq OWNED BY public.videos.id;

--
-- Set default values for sequences
--
ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.banners_id_seq'::regclass);
ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);
ALTER TABLE ONLY public.donation_categories ALTER COLUMN id SET DEFAULT nextval('public.donation_categories_id_seq'::regclass);
ALTER TABLE ONLY public.donations ALTER COLUMN id SET DEFAULT nextval('public.donations_id_seq'::regclass);
ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);
ALTER TABLE ONLY public.gallery ALTER COLUMN id SET DEFAULT nextval('public.gallery_id_seq'::regclass);
ALTER TABLE ONLY public.quotes ALTER COLUMN id SET DEFAULT nextval('public.quotes_id_seq'::regclass);
ALTER TABLE ONLY public.social_links ALTER COLUMN id SET DEFAULT nextval('public.social_links_id_seq'::regclass);
ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);
ALTER TABLE ONLY public.testimonials ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER TABLE ONLY public.videos ALTER COLUMN id SET DEFAULT nextval('public.videos_id_seq'::regclass);

--
-- Insert sample data
--

-- Insert default admin user (password: iskcon123)
INSERT INTO public.users (username, email, password, first_name, last_name, is_admin) VALUES
('iskconadmin', 'admin@iskconjuhu.org', '$2b$10$8K1p/a9l4FO4LlvDrQehfOuBXOz.JivMjj8VW4lqIa/Yb8J8P1uJa', 'ISKCON', 'Admin', true);

-- Insert donation categories
INSERT INTO public.donation_categories (name, description, suggested_amount, order_index) VALUES
('Temple Renovation', 'Support the renovation and maintenance of our beautiful temple', 5000, 1),
('Food for All', 'Help us serve free meals to devotees and visitors', 1000, 2),
('Education Programs', 'Support spiritual education and cultural programs', 2000, 3),
('Deity Services', 'Contribute to daily deity worship and ceremonies', 3000, 4),
('Festival Celebrations', 'Help organize grand festivals and celebrations', 2500, 5),
('General Donation', 'Support the overall mission of ISKCON Juhu', 1000, 6);

-- Insert banners
INSERT INTO public.banners (title, description, image_url, order_index) VALUES
('Welcome to ISKCON Juhu', 'Experience divine consciousness at one of Mumbai''s most sacred temples', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200', 1),
('Join Our Community', 'Be part of a spiritual family dedicated to Krishna consciousness', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200', 2),
('Daily Programs', 'Participate in our daily arati, kirtan, and spiritual activities', 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=1200', 3);

-- Insert quotes
INSERT INTO public.quotes (text, author, source, order_index) VALUES
('The Supreme Lord said: Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.', 'Lord Krishna', 'Bhagavad Gita 18.66', 1),
('One should chant the holy name of the Lord in a humble state of mind, thinking oneself lower than the straw in the street.', 'Sri Chaitanya Mahaprabhu', 'Shikshashtaka 3', 2),
('The ultimate goal of life is to develop pure love of God, Krishna consciousness.', 'A.C. Bhaktivedanta Swami Prabhupada', 'Teachings', 3);

-- Insert events
INSERT INTO public.events (title, description, date, location, image_url, is_featured) VALUES
('Janmashtami Celebration', 'Grand celebration of Lord Krishna''s appearance day with midnight arati', '2024-08-26 23:30:00', 'ISKCON Juhu Temple', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', true),
('Ratha Yatra Festival', 'Annual chariot festival with Lord Jagannath', '2024-07-07 16:00:00', 'Juhu Beach to Temple', 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=800', true),
('Sunday Feast Program', 'Weekly spiritual program with kirtan, lecture, and prasadam', '2024-06-30 17:00:00', 'ISKCON Juhu Temple', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', false);

-- Insert gallery items
INSERT INTO public.gallery (title, description, image_url, category, is_featured, order_index) VALUES
('Temple Entrance', 'Beautiful entrance to ISKCON Juhu temple', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', 'Architecture', true, 1),
('Deity Darshan', 'Sri Sri Radha Rasabihari during morning arati', 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=600', 'Deities', true, 2),
('Festival Celebrations', 'Devotees celebrating Janmashtami', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', 'Festivals', false, 3),
('Temple Gardens', 'Beautiful gardens surrounding the temple', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', 'Nature', false, 4);

-- Insert videos
INSERT INTO public.videos (title, description, video_url, thumbnail_url, duration, category, is_featured, order_index) VALUES
('Jagannath Rath Yatra 2024', 'Highlights from the annual Ratha Yatra celebration', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=600', '15:30', 'Festivals', true, 1),
('Daily Temple Program', 'Experience our daily spiritual activities', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', '8:45', 'Daily Programs', false, 2),
('Bhagavad Gita Class', 'Weekly spiritual discourse on Bhagavad Gita', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', '45:20', 'Education', false, 3);

--
-- Add constraints
--
ALTER TABLE ONLY public.banners ADD CONSTRAINT banners_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.contact_messages ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.donation_categories ADD CONSTRAINT donation_categories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.donations ADD CONSTRAINT donations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.events ADD CONSTRAINT events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.gallery ADD CONSTRAINT gallery_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.quotes ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.social_links ADD CONSTRAINT social_links_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.subscriptions ADD CONSTRAINT subscriptions_email_key UNIQUE (email);
ALTER TABLE ONLY public.subscriptions ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.testimonials ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_username_key UNIQUE (username);
ALTER TABLE ONLY public.videos ADD CONSTRAINT videos_pkey PRIMARY KEY (id);

--
-- Add foreign key constraints
--
ALTER TABLE ONLY public.donations ADD CONSTRAINT donations_category_id_donation_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.donation_categories(id);

--
-- Grant all permissions to iskcon_user
--
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iskcon_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iskcon_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO iskcon_user;

--
-- PostgreSQL database dump complete
--
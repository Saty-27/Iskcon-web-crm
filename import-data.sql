-- Import sample data for ISKCON Juhu
-- This matches your current data structure

-- Insert banners
INSERT INTO banners (id, title, description, "imageUrl", "imageAlt", "buttonText", "buttonLink", "isActive", "order") VALUES
(3, '', '', '/uploads/banners/banner-1752327785564-760123996.jpeg', NULL, '', '', true, 0)
ON CONFLICT (id) DO NOTHING;

-- Insert events
INSERT INTO events (id, title, description, "imageUrl", date, "isActive") VALUES
(1, 'Janmastami', 'th', '/uploads/events/event-1752327819725-647073847.jpg', '2024-08-26', true)
ON CONFLICT (id) DO NOTHING;

-- Insert donation categories
INSERT INTO donation_categories (id, name, description, "isActive") VALUES
(33, 'jhHJ', 'fdgdfgd', true)
ON CONFLICT (id) DO NOTHING;

-- Insert schedules
INSERT INTO schedules (id, time, title, description) VALUES
(1, '04:30 AM', 'Mangala Arti', 'Morning prayers and rituals')
ON CONFLICT (id) DO NOTHING;

-- Insert quotes
INSERT INTO quotes (id, text, source) VALUES
(1, 'hjfjdhjdhf', 'dmfndnfdn')
ON CONFLICT (id) DO NOTHING;

-- Insert stats
INSERT INTO stats (id, value, suffix, label) VALUES
(1, 300, 'cr+', 'Meals Served')
ON CONFLICT (id) DO NOTHING;

-- Insert gallery
INSERT INTO gallery (id, title, "imageUrl") VALUES
(1, '', '/uploads/gallery/gallery-1752326260557-190274525.png')
ON CONFLICT (id) DO NOTHING;

-- Insert videos
INSERT INTO videos (id, title, "thumbnailUrl", "videoUrl") VALUES
(1, 'this is video', '/uploads/videos/video-1752327914647-33452720.jpg', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
ON CONFLICT (id) DO NOTHING;

-- Insert social links
INSERT INTO social_links (id, platform, url) VALUES
(1, 'Facebook', 'https://facebook.com/iskconjuhu')
ON CONFLICT (id) DO NOTHING;

-- Insert live videos
INSERT INTO live_videos (id, title, "youtubeUrl", "isActive") VALUES
(1, 'Live Arti', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true)
ON CONFLICT (id) DO NOTHING;

-- Insert admin user
INSERT INTO users (id, username, email, password, role, "isActive") VALUES
(1, 'isk_conjuhuadmin', 'admin@iskconjuhu.com', '$2b$10$XGKqK5Z8V5Q8Q5Q8Q5Q8Q5Q8Q5Q8Q5Q8Q5Q8Q5Q8Q5Q8Q5Q8Q5Q8Q', 'admin', true)
ON CONFLICT (id) DO NOTHING;
# VPS Manual Deployment Commands

Since you're now connected to your VPS, run these commands in sequence:

## Step 1: Create the deployment script
```bash
cat > vps-deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting ISKCON Juhu VPS Deployment..."

# Check PostgreSQL connection
echo "🔍 Testing PostgreSQL connection..."
psql -h localhost -U iskcon_user -d iskcon_juhu_db -c "SELECT 1;"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create database schema
echo "🏗️  Creating database schema..."
npm run db:push

# Create import file
echo "📝 Creating data import file..."
cat > final-import.sql << 'SQLEOF'
-- Clear existing test data
DELETE FROM banners WHERE title = '' OR title IS NULL;
DELETE FROM donation_categories WHERE name = 'jhHJ';
DELETE FROM quotes WHERE text = 'hjfjdhjdhf';

-- Insert admin user
INSERT INTO users (username, password, email, name, role, is_active) VALUES
('isk_conjuhuadmin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@iskconjuhu.com', 'Admin User', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- Insert proper banners
INSERT INTO banners (title, description, image_url, image_alt, button_text, button_link, is_active, "order") VALUES
('Welcome to ISKCON Juhu', 'Experience divine spirituality at our sacred temple', '/uploads/banners/welcome.jpg', 'ISKCON Juhu Temple', 'Visit Temple', '/', true, 1),
('Janmashtami Festival', 'Join us for the grand celebration of Krishna Janmashtami', '/uploads/banners/janmashtami.jpg', 'Janmashtami Festival', 'Learn More', '/events/1', true, 2),
('Daily Arti Darshan', 'Experience divine darshan and participate in daily arti', '/uploads/banners/arti.jpg', 'Daily Arti', 'View Schedule', '/schedule', true, 3),
('Donate for Noble Cause', 'Support our temple activities and help serve the community', '/uploads/banners/donation.jpg', 'Donation', 'Donate Now', '/donate', true, 4);

-- Insert donation categories
INSERT INTO donation_categories (name, description, image_url, is_active, "order") VALUES
('Temple Renovation', 'Support the maintenance and development of our sacred temple infrastructure', '/uploads/categories/renovation.jpg', true, 1),
('Food Distribution', 'Help us feed the needy through our daily prasadam distribution program', '/uploads/categories/food.jpg', true, 2),
('Educational Programs', 'Support spiritual education and Krishna consciousness programs', '/uploads/categories/education.jpg', true, 3),
('Festival Celebrations', 'Sponsor religious festivals and special events throughout the year', '/uploads/categories/festivals.jpg', true, 4),
('Cow Protection', 'Support our goshala and cow protection activities', '/uploads/categories/cows.jpg', true, 5);

-- Insert events
INSERT INTO events (title, description, image_url, date, is_active) VALUES
('Janmashtami 2024', 'Grand celebration of Lord Krishna birth anniversary with special programs', '/uploads/events/janmashtami.jpg', '2024-08-26', true),
('Radhashtami 2024', 'Celebrate the divine appearance day of Srimati Radharani', '/uploads/events/radhashtami.jpg', '2024-09-11', true),
('Diwali Celebration', 'Festival of lights celebration with special arti and cultural programs', '/uploads/events/diwali.jpg', '2024-11-01', true),
('Kartik Month Special', 'Special programs and offerings during the sacred month of Kartik', '/uploads/events/kartik.jpg', '2024-10-15', true);

-- Insert spiritual quotes
INSERT INTO quotes (text, source, is_active, "order") VALUES
('Man is made by his belief. As he believes, so he is.', 'Bhagavad Gita', true, 1),
('The soul is neither born, nor does it die. It is not slain when the body is slain.', 'Bhagavad Gita 2.20', true, 2),
('Whatever happened, happened for the good. Whatever is happening, is happening for the good.', 'Bhagavad Gita', true, 3),
('You have the right to work, but never to the fruit of work.', 'Bhagavad Gita 2.47', true, 4),
('The mind is everything. What you think you become.', 'Bhagavad Gita', true, 5);

-- Insert temple statistics
INSERT INTO stats (value, suffix, label, is_active, order_index) VALUES
(50000, '+', 'Devotees Served', true, 1),
(300, 'cr+', 'Meals Served', true, 2),
(25, '+', 'Years of Service', true, 3),
(100, '+', 'Daily Programs', true, 4),
(500, '+', 'Monthly Visitors', true, 5);

-- Insert daily schedule
INSERT INTO schedules (time, title, description, is_active, order_index) VALUES
('04:30 AM', 'Mangala Arti', 'Morning prayer and worship to begin the day', true, 1),
('07:30 AM', 'Tulsi Arti', 'Sacred prayer to Tulsi Maharani', true, 2),
('08:00 AM', 'Darshan Arti', 'Daily deity darshan for all devotees', true, 3),
('12:30 PM', 'Raj Bhog Arti', 'Midday offering to Their Lordships', true, 4),
('04:30 PM', 'Utthapan Arti', 'Afternoon awakening ceremony', true, 5),
('07:00 PM', 'Sandhya Arti', 'Evening prayer and worship', true, 6),
('08:30 PM', 'Shayana Arti', 'Night rest ceremony for the deities', true, 7);

-- Insert social media links
INSERT INTO social_links (platform, url, icon, is_active) VALUES
('Facebook', 'https://facebook.com/iskconjuhu', 'facebook', true),
('Instagram', 'https://instagram.com/iskconjuhu', 'instagram', true),
('YouTube', 'https://youtube.com/iskconjuhu', 'youtube', true),
('Twitter', 'https://twitter.com/iskconjuhu', 'twitter', true),
('WhatsApp', 'https://wa.me/919876543210', 'whatsapp', true);

-- Insert testimonials
INSERT INTO testimonials (name, location, message, image_url, is_active) VALUES
('Rajesh Sharma', 'Mumbai', 'ISKCON Juhu has completely transformed my spiritual journey. The daily programs and devotional atmosphere have brought immense peace to my life.', '/uploads/testimonials/person1.jpg', true),
('Priya Patel', 'Delhi', 'The prasadam distribution program helped my family during our most difficult times. The temple community support is incredible.', '/uploads/testimonials/person2.jpg', true),
('Amit Kumar', 'Bangalore', 'Regular participation in temple activities has given me clarity and purpose. The spiritual guidance here is unparalleled.', '/uploads/testimonials/person3.jpg', true),
('Meera Gupta', 'Pune', 'The festival celebrations at ISKCON Juhu are absolutely divine. Every visit fills my heart with devotion and joy.', '/uploads/testimonials/person4.jpg', true);
SQLEOF

# Import data
echo "📊 Importing data..."
psql -h localhost -U iskcon_user -d iskcon_juhu_db -f final-import.sql

# Build application
echo "🏗️  Building application..."
npm run build

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 delete iskcon-juhu 2>/dev/null || true
pm2 start ecosystem.config.js

# Show status
echo "📊 Application status:"
pm2 status

echo "🎉 ISKCON Juhu deployment completed successfully!"
EOF

chmod +x vps-deploy.sh
./vps-deploy.sh
```

## Or run these commands step by step:

### Step 1: Test database connection
```bash
psql -h localhost -U iskcon_user -d iskcon_juhu_db -c "SELECT 1;"
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Create database schema
```bash
npm run db:push
```

### Step 4: Create and import data
```bash
nano final-import.sql
# Copy the SQL content from the script above
psql -h localhost -U iskcon_user -d iskcon_juhu_db -f final-import.sql
```

### Step 5: Build and start
```bash
npm run build
pm2 start ecosystem.config.js
```

### Step 6: Check status
```bash
pm2 status
curl http://localhost:3000
```

Run the first command block to create and execute the deployment script automatically.
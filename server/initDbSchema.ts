import { pool } from "./db";

/**
 * Automatically ensures all required tables and columns exist in PostgreSQL
 * Eliminates "column does not exist" errors on VPS database.
 */
export async function initializeDatabaseSchema() {
  try {
    console.log("Checking and syncing PostgreSQL database schema...");

    await pool.query(`
      -- 1. Banners Table Columns
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS screen_type TEXT NOT NULL DEFAULT 'desktop';
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS image_alt TEXT;
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS button_text TEXT;
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS button_link TEXT;
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE banners ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

      -- 2. Gallery Table Columns
      ALTER TABLE gallery ADD COLUMN IF NOT EXISTS image_alt TEXT;
      ALTER TABLE gallery ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

      -- 3. Videos Table Columns
      ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_alt TEXT;
      ALTER TABLE videos ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

      -- 4. Donation Categories Columns
      ALTER TABLE donation_categories ADD COLUMN IF NOT EXISTS image_alt TEXT;
      ALTER TABLE donation_categories ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE donation_categories ADD COLUMN IF NOT EXISTS slug TEXT;
      ALTER TABLE donation_categories ADD COLUMN IF NOT EXISTS custom_amount_enabled BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE donation_categories ADD COLUMN IF NOT EXISTS custom_amount_title TEXT;
      ALTER TABLE donation_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

      -- 5. Events Columns
      ALTER TABLE events ADD COLUMN IF NOT EXISTS image_alt TEXT;
      ALTER TABLE events ADD COLUMN IF NOT EXISTS custom_amount_enabled BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE events ADD COLUMN IF NOT EXISTS custom_amount_title TEXT;
      ALTER TABLE events ADD COLUMN IF NOT EXISTS read_more_link TEXT;
      ALTER TABLE events ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

      -- 6. Donation Cards Columns
      ALTER TABLE donation_cards ADD COLUMN IF NOT EXISTS image_alt TEXT;
      ALTER TABLE donation_cards ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE donation_cards ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

      -- 7. Event Donation Cards Columns
      ALTER TABLE event_donation_cards ADD COLUMN IF NOT EXISTS image_alt TEXT;
      ALTER TABLE event_donation_cards ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE event_donation_cards ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

      -- 8. Blog Posts Columns
      ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
      ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
      ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
      ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS canonical_url TEXT;
      ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS og_image TEXT;
      ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'ISKCON Juhu';
      ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
    `);

    console.log("✓ Database schema synchronized successfully");
  } catch (error) {
    console.error("Error during database schema synchronization:", error);
  }
}

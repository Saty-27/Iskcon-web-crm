import { pgTable, text, varchar, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role").default("user").notNull(), // 'super_admin' | 'admin' | 'user'
  permissions: json("permissions").$type<string[] | null>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

// Banners table
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt"), // SEO alt text for banner image
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  screenType: text("screen_type").default("desktop").notNull(), // 'desktop' | 'mobile'
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").notNull().default(0),
});

export const insertBannerSchema = createInsertSchema(banners).omit({
  id: true,
});

// Quotes table
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  source: text("source"),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").notNull(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
});

// Donation categories table
export const donationCategories = pgTable("donation_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt"), // SEO alt text for category image
  heading: text("heading"),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").notNull(),
  suggestedAmounts: json("suggested_amounts").$type<number[] | null>(),
});

export const insertDonationCategorySchema = createInsertSchema(donationCategories).omit({
  id: true,
});

// Donation cards table - predefined donation options for each category
export const donationCards = pgTable("donation_cards", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => donationCategories.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").notNull(),
});

export const insertDonationCardSchema = createInsertSchema(donationCards).omit({
  id: true,
});

// Bank details table - for bank transfer information
export const bankDetails = pgTable("bank_details", {
  id: serial("id").primaryKey(),
  accountName: text("account_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  swiftCode: text("swift_code"),
  qrCodeUrl: text("qr_code_url"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertBankDetailsSchema = createInsertSchema(bankDetails).omit({
  id: true,
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  imageAlt: text("image_alt"), // SEO alt text for event image
  readMoreUrl: text("read_more_url"),
  isActive: boolean("is_active").default(true).notNull(),
  suggestedAmounts: json("suggested_amounts").$type<number[] | null>(),
  customDonationEnabled: boolean("custom_donation_enabled").default(true).notNull(),
  customDonationTitle: text("custom_donation_title").default("Any Donation of Your Choice").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  date: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

// Event donation cards table - for predefined donation amounts per event
export const eventDonationCards = pgTable("event_donation_cards", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEventDonationCardSchema = createInsertSchema(eventDonationCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Event bank details table - specific bank details per event
export const eventBankDetails = pgTable("event_bank_details", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: 'cascade' }).notNull(),
  accountName: text("account_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  swiftCode: text("swift_code"),
  qrCodeUrl: text("qr_code_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEventBankDetailsSchema = createInsertSchema(eventBankDetails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Category-specific bank details table
export const categoryBankDetails = pgTable("category_bank_details", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => donationCategories.id, { onDelete: 'cascade' }).notNull(),
  accountName: text("account_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  swiftCode: text("swift_code"),
  qrCodeUrl: text("qr_code_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCategoryBankDetailsSchema = createInsertSchema(categoryBankDetails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CategoryBankDetails = typeof categoryBankDetails.$inferSelect;
export type InsertCategoryBankDetails = typeof categoryBankDetails.$inferInsert;

// Gallery table
export const gallery = pgTable("gallery", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt"), // SEO alt text for gallery image
  order: integer("order").notNull(),
});

export const insertGallerySchema = createInsertSchema(gallery).omit({
  id: true,
});

// Videos table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  thumbnailAlt: text("thumbnail_alt"), // SEO alt text for video thumbnail
  youtubeUrl: text("youtube_url").notNull(),
  order: integer("order").notNull(),
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
});

// Live videos table
export const liveVideos = pgTable("live_videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLiveVideoSchema = createInsertSchema(liveVideos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LiveVideo = typeof liveVideos.$inferSelect;
export type InsertLiveVideo = typeof liveVideos.$inferInsert;

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  message: text("message").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Social links table
export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
  createdAt: true,
});

// Donations table
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  categoryId: integer("category_id").references(() => donationCategories.id),
  eventId: integer("event_id").references(() => events.id),
  amount: integer("amount").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  panCard: text("pan_card"),
  message: text("message"),
  paymentId: text("payment_id"),
  status: text("status").default("pending").notNull(),
  paymentGatewayResponse: text("payment_gateway_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  invoiceNumber: text("invoice_number"),
  receiptSent: boolean("receipt_sent").default(false),
  notificationSent: boolean("notification_sent").default(false),
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Banner = typeof banners.$inferSelect;
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type DonationCategory = typeof donationCategories.$inferSelect;
export type InsertDonationCategory = z.infer<typeof insertDonationCategorySchema>;
export type DonationCard = typeof donationCards.$inferSelect;
export type InsertDonationCard = z.infer<typeof insertDonationCardSchema>;
export type BankDetails = typeof bankDetails.$inferSelect;
export type InsertBankDetails = z.infer<typeof insertBankDetailsSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventDonationCard = typeof eventDonationCards.$inferSelect;
export type InsertEventDonationCard = z.infer<typeof insertEventDonationCardSchema>;
export type EventBankDetails = typeof eventBankDetails.$inferSelect;
export type InsertEventBankDetails = z.infer<typeof insertEventBankDetailsSchema>;
export type Gallery = typeof gallery.$inferSelect;
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;
export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Stats table for the counter section
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  value: integer("value").notNull(),
  suffix: varchar("suffix", { length: 20 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Stat = typeof stats.$inferSelect;
export type InsertStat = typeof stats.$inferInsert;

// Temple schedule table
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  time: varchar("time", { length: 10 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;

// Insert schemas for stats and schedules
export const insertStatSchema = createInsertSchema(stats, {
  value: z.number().min(1),
  suffix: z.string().min(1).max(20),
  label: z.string().min(1).max(255),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduleSchema = createInsertSchema(schedules, {
  time: z.string().min(1).max(10),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt"), // SEO alt text for main image
  author: text("author").notNull(),
  readTime: integer("read_time").notNull(), // in minutes
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  seoTitle: text("seo_title"), // SEO meta title
  seoDescription: text("seo_description"), // SEO meta description
  seoKeywords: text("seo_keywords"), // SEO keywords
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

export const insertBlogPostSchema = createInsertSchema(blogPosts, {
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().min(1), // Allow any non-empty string for relative URLs
  imageAlt: z.string().min(1).max(125).optional(),
  author: z.string().min(1).max(100),
  readTime: z.number().min(1),
  publishedAt: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
  seoTitle: z.string().min(1).max(60).optional(),
  seoDescription: z.string().min(1).max(160).optional(),
  seoKeywords: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Conversations table for real-time private User-to-Admin chat
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  status: text("status").default("active").notNull(), // 'active', 'archived', 'closed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  lastMessageText: text("last_message_text"),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
});

// Messages table for chat history
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  senderId: integer("sender_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  senderType: text("sender_type").notNull(), // 'user' | 'admin'
  message: text("message"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export const insertMessageSchema = createInsertSchema(messages, {
  message: z.string().max(5000).optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().max(1024 * 1024, "File must be smaller than 1 MB").optional(),
  fileType: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

// Audit logs table for administrative action tracking
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  userName: text("user_name"),
  userRole: text("user_role"),
  action: text("action").notNull(), // 'create' | 'update' | 'delete' | 'login' | 'status_change' | 'reset_password' | 'permission_change'
  section: text("section").notNull(), // 'donations' | 'gallery' | 'videos' | 'staff' | 'banners' | 'events' | 'chat' | 'users' | 'quotes' | 'blog' | 'settings'
  targetId: text("target_id"),
  details: json("details").$type<Record<string, any> | null>(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});


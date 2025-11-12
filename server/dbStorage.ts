import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { 
  users, banners, quotes, donationCategories, donationCards, eventDonationCards, bankDetails, eventBankDetails, categoryBankDetails, events, gallery, videos, liveVideos,
  testimonials, contactMessages, socialLinks, donations, subscriptions,
  stats, schedules, blogPosts,
  type User, type InsertUser, type Banner, type InsertBanner,
  type Quote, type InsertQuote, type DonationCategory, type InsertDonationCategory,
  type DonationCard, type InsertDonationCard, type EventDonationCard, type InsertEventDonationCard,
  type BankDetails, type InsertBankDetails, type CategoryBankDetails, type InsertCategoryBankDetails,
  type Event, type InsertEvent, type Gallery, type InsertGallery,
  type Video, type InsertVideo, type LiveVideo, type InsertLiveVideo, type Testimonial, type InsertTestimonial,
  type ContactMessage, type InsertContactMessage, type SocialLink, type InsertSocialLink,
  type Donation, type InsertDonation, type Subscription, type InsertSubscription,
  type Stat, type InsertStat, type Schedule, type InsertSchedule,
  type BlogPost, type InsertBlogPost
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  // Banner operations
  async getBanners(): Promise<Banner[]> {
    return await db.select().from(banners);
  }

  async getBanner(id: number): Promise<Banner | undefined> {
    const [banner] = await db.select().from(banners).where(eq(banners.id, id));
    return banner;
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const [newBanner] = await db.insert(banners).values(banner).returning();
    return newBanner;
  }

  async updateBanner(id: number, bannerData: Partial<Banner>): Promise<Banner | undefined> {
    const [banner] = await db.update(banners).set(bannerData).where(eq(banners.id, id)).returning();
    return banner;
  }

  async deleteBanner(id: number): Promise<boolean> {
    const result = await db.delete(banners).where(eq(banners.id, id));
    return result.rowCount > 0;
  }

  // Quote operations
  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes);
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [newQuote] = await db.insert(quotes).values(quote).returning();
    return newQuote;
  }

  async updateQuote(id: number, quoteData: Partial<Quote>): Promise<Quote | undefined> {
    const [quote] = await db.update(quotes).set(quoteData).where(eq(quotes.id, id)).returning();
    return quote;
  }

  async deleteQuote(id: number): Promise<boolean> {
    const result = await db.delete(quotes).where(eq(quotes.id, id));
    return result.rowCount > 0;
  }

  // Donation category operations
  async getDonationCategories(): Promise<DonationCategory[]> {
    return await db.select().from(donationCategories);
  }

  async getDonationCategory(id: number): Promise<DonationCategory | undefined> {
    const [category] = await db.select().from(donationCategories).where(eq(donationCategories.id, id));
    return category;
  }

  async createDonationCategory(category: InsertDonationCategory): Promise<DonationCategory> {
    const [newCategory] = await db.insert(donationCategories).values(category).returning();
    return newCategory;
  }

  async updateDonationCategory(id: number, categoryData: Partial<DonationCategory>): Promise<DonationCategory | undefined> {
    const [category] = await db.update(donationCategories).set(categoryData).where(eq(donationCategories.id, id)).returning();
    return category;
  }

  async deleteDonationCategory(id: number): Promise<{ success: boolean; message?: string; deletedCards?: number }> {
    try {
      // First check if there are any donations referencing this category
      const existingDonations = await db.select().from(donations).where(eq(donations.categoryId, id));
      
      if (existingDonations.length > 0) {
        return {
          success: false,
          message: `Cannot delete category with ${existingDonations.length} existing donation(s). Please contact administrator to handle existing donations first.`
        };
      }

      // Delete related donation cards first
      const deletedCards = await db.delete(donationCards).where(eq(donationCards.categoryId, id));
      const deletedCardsCount = deletedCards.rowCount || 0;

      // Then delete the category
      const result = await db.delete(donationCategories).where(eq(donationCategories.id, id));
      
      return {
        success: result.rowCount > 0,
        deletedCards: deletedCardsCount
      };
    } catch (error) {
      console.error('Error in deleteDonationCategory:', error);
      return {
        success: false,
        message: 'Database error occurred while deleting category'
      };
    }
  }

  // Donation card operations
  async getDonationCards(): Promise<DonationCard[]> {
    return await db.select().from(donationCards);
  }

  async getDonationCard(id: number): Promise<DonationCard | undefined> {
    const [card] = await db.select().from(donationCards).where(eq(donationCards.id, id));
    return card;
  }

  async getDonationCardsByCategory(categoryId: number): Promise<DonationCard[]> {
    return await db.select().from(donationCards)
      .where(eq(donationCards.categoryId, categoryId))
      .orderBy(donationCards.order, donationCards.id);
  }

  async createDonationCard(card: InsertDonationCard): Promise<DonationCard> {
    // Check for existing card with same title and amount in the same category to prevent duplicates
    const existingCard = await db.select().from(donationCards)
      .where(and(
        eq(donationCards.categoryId, card.categoryId),
        eq(donationCards.title, card.title),
        eq(donationCards.amount, card.amount)
      ))
      .limit(1);
    
    if (existingCard.length > 0) {
      console.log('Duplicate card detected, updating existing instead of creating new:', existingCard[0]);
      // Update the existing card with new data
      const [updatedCard] = await db.update(donationCards)
        .set({
          description: card.description,
          imageUrl: card.imageUrl,
          isActive: card.isActive,
          order: card.order
        })
        .where(eq(donationCards.id, existingCard[0].id))
        .returning();
      return updatedCard;
    }
    
    console.log('Creating new card:', card);
    const [newCard] = await db.insert(donationCards).values(card).returning();
    return newCard;
  }

  async updateDonationCard(id: number, cardData: Partial<DonationCard>): Promise<DonationCard | undefined> {
    const [card] = await db.update(donationCards).set(cardData).where(eq(donationCards.id, id)).returning();
    return card;
  }

  async deleteDonationCard(id: number): Promise<boolean> {
    const result = await db.delete(donationCards).where(eq(donationCards.id, id));
    return result.rowCount > 0;
  }

  // Bank details operations
  async getBankDetails(): Promise<BankDetails[]> {
    return await db.select().from(bankDetails);
  }

  async getBankDetail(id: number): Promise<BankDetails | undefined> {
    const [detail] = await db.select().from(bankDetails).where(eq(bankDetails.id, id));
    return detail;
  }

  async createBankDetails(details: InsertBankDetails): Promise<BankDetails> {
    const [newDetails] = await db.insert(bankDetails).values(details).returning();
    return newDetails;
  }

  async updateBankDetails(id: number, detailsData: Partial<BankDetails>): Promise<BankDetails | undefined> {
    const [details] = await db.update(bankDetails).set(detailsData).where(eq(bankDetails.id, id)).returning();
    return details;
  }

  async deleteBankDetails(id: number): Promise<boolean> {
    const result = await db.delete(bankDetails).where(eq(bankDetails.id, id));
    return result.rowCount > 0;
  }

  // Event-specific bank details operations
  async getEventBankDetails(eventId: number): Promise<BankDetails[]> {
    return await db.select().from(eventBankDetails).where(eq(eventBankDetails.eventId, eventId));
  }

  async getEventBankDetail(id: number): Promise<BankDetails | undefined> {
    const [detail] = await db.select().from(eventBankDetails).where(eq(eventBankDetails.id, id));
    return detail;
  }

  async createEventBankDetails(details: any): Promise<BankDetails> {
    const [newDetails] = await db.insert(eventBankDetails).values(details).returning();
    return newDetails;
  }

  async updateEventBankDetails(id: number, detailsData: any): Promise<BankDetails | undefined> {
    const [details] = await db.update(eventBankDetails).set(detailsData).where(eq(eventBankDetails.id, id)).returning();
    return details;
  }

  async deleteEventBankDetails(id: number): Promise<boolean> {
    const result = await db.delete(eventBankDetails).where(eq(eventBankDetails.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Category-specific bank details operations
  async getCategoryBankDetails(categoryId: number): Promise<CategoryBankDetails[]> {
    return await db.select().from(categoryBankDetails).where(eq(categoryBankDetails.categoryId, categoryId));
  }

  async getCategoryBankDetail(id: number): Promise<CategoryBankDetails | undefined> {
    const [detail] = await db.select().from(categoryBankDetails).where(eq(categoryBankDetails.id, id));
    return detail;
  }

  async createCategoryBankDetails(details: InsertCategoryBankDetails): Promise<CategoryBankDetails> {
    const [newDetails] = await db.insert(categoryBankDetails).values(details).returning();
    return newDetails;
  }

  async updateCategoryBankDetails(id: number, detailsData: Partial<CategoryBankDetails>): Promise<CategoryBankDetails | undefined> {
    const [details] = await db.update(categoryBankDetails).set(detailsData).where(eq(categoryBankDetails.id, id)).returning();
    return details;
  }

  async deleteCategoryBankDetails(id: number): Promise<boolean> {
    const result = await db.delete(categoryBankDetails).where(eq(categoryBankDetails.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const [event] = await db.update(events).set(eventData).where(eq(events.id, id)).returning();
    return event;
  }

  async deleteEvent(id: number): Promise<boolean> {
    try {
      // The database schema has ON DELETE CASCADE for related tables,
      // so deleting the event should automatically delete related records
      const result = await db.delete(events).where(eq(events.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  // Event donation card operations
  async getEventDonationCards(eventId: number): Promise<EventDonationCard[]> {
    return await db.select().from(eventDonationCards).where(eq(eventDonationCards.eventId, eventId));
  }

  async getEventDonationCard(id: number): Promise<EventDonationCard | undefined> {
    const [card] = await db.select().from(eventDonationCards).where(eq(eventDonationCards.id, id));
    return card;
  }

  async createEventDonationCard(card: InsertEventDonationCard): Promise<EventDonationCard> {
    const [newCard] = await db.insert(eventDonationCards).values(card).returning();
    return newCard;
  }

  async updateEventDonationCard(id: number, cardData: Partial<EventDonationCard>): Promise<EventDonationCard | undefined> {
    const [card] = await db.update(eventDonationCards).set(cardData).where(eq(eventDonationCards.id, id)).returning();
    return card;
  }

  async deleteEventDonationCard(id: number): Promise<boolean> {
    const result = await db.delete(eventDonationCards).where(eq(eventDonationCards.id, id));
    return result.rowCount > 0;
  }

  // Gallery operations
  async getGalleryItems(): Promise<Gallery[]> {
    return await db.select().from(gallery);
  }

  async getGalleryItem(id: number): Promise<Gallery | undefined> {
    const [item] = await db.select().from(gallery).where(eq(gallery.id, id));
    return item;
  }

  async createGalleryItem(galleryItem: InsertGallery): Promise<Gallery> {
    const [newItem] = await db.insert(gallery).values(galleryItem).returning();
    return newItem;
  }

  async updateGalleryItem(id: number, galleryData: Partial<Gallery>): Promise<Gallery | undefined> {
    const [item] = await db.update(gallery).set(galleryData).where(eq(gallery.id, id)).returning();
    return item;
  }

  async deleteGalleryItem(id: number): Promise<boolean> {
    const result = await db.delete(gallery).where(eq(gallery.id, id));
    return result.rowCount > 0;
  }

  // Video operations
  async getVideos(): Promise<Video[]> {
    return await db.select().from(videos);
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async updateVideo(id: number, videoData: Partial<Video>): Promise<Video | undefined> {
    const [video] = await db.update(videos).set(videoData).where(eq(videos.id, id)).returning();
    return video;
  }

  async deleteVideo(id: number): Promise<boolean> {
    const result = await db.delete(videos).where(eq(videos.id, id));
    return result.rowCount > 0;
  }

  // Live Video operations
  async getLiveVideos(): Promise<LiveVideo[]> {
    return await db.select().from(liveVideos);
  }

  async getLiveVideo(id: number): Promise<LiveVideo | undefined> {
    const [liveVideo] = await db.select().from(liveVideos).where(eq(liveVideos.id, id));
    return liveVideo;
  }

  async createLiveVideo(liveVideo: InsertLiveVideo): Promise<LiveVideo> {
    const [newLiveVideo] = await db.insert(liveVideos).values(liveVideo).returning();
    return newLiveVideo;
  }

  async updateLiveVideo(id: number, liveVideoData: Partial<LiveVideo>): Promise<LiveVideo | undefined> {
    const [liveVideo] = await db.update(liveVideos).set(liveVideoData).where(eq(liveVideos.id, id)).returning();
    return liveVideo;
  }

  async deleteLiveVideo(id: number): Promise<boolean> {
    const result = await db.delete(liveVideos).where(eq(liveVideos.id, id));
    return result.rowCount > 0;
  }

  // Testimonial operations
  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return testimonial;
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [newTestimonial] = await db.insert(testimonials).values(testimonial).returning();
    return newTestimonial;
  }

  async updateTestimonial(id: number, testimonialData: Partial<Testimonial>): Promise<Testimonial | undefined> {
    const [testimonial] = await db.update(testimonials).set(testimonialData).where(eq(testimonials.id, id)).returning();
    return testimonial;
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    const result = await db.delete(testimonials).where(eq(testimonials.id, id));
    return result.rowCount > 0;
  }

  // Contact message operations
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages);
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async updateContactMessage(id: number, messageData: Partial<ContactMessage>): Promise<ContactMessage | undefined> {
    const [message] = await db.update(contactMessages).set(messageData).where(eq(contactMessages.id, id)).returning();
    return message;
  }

  async markContactMessageAsRead(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.update(contactMessages)
      .set({ isRead: true })
      .where(eq(contactMessages.id, id))
      .returning();
    return message;
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return result.rowCount > 0;
  }

  // Social link operations
  async getSocialLinks(): Promise<SocialLink[]> {
    return await db.select().from(socialLinks);
  }

  async getSocialLink(id: number): Promise<SocialLink | undefined> {
    const [link] = await db.select().from(socialLinks).where(eq(socialLinks.id, id));
    return link;
  }

  async createSocialLink(link: InsertSocialLink): Promise<SocialLink> {
    const [newLink] = await db.insert(socialLinks).values(link).returning();
    return newLink;
  }

  async updateSocialLink(id: number, linkData: Partial<SocialLink>): Promise<SocialLink | undefined> {
    const [link] = await db.update(socialLinks).set(linkData).where(eq(socialLinks.id, id)).returning();
    return link;
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    const result = await db.delete(socialLinks).where(eq(socialLinks.id, id));
    return result.rowCount > 0;
  }

  // Donation operations
  async getDonations(): Promise<Donation[]> {
    return await db.select().from(donations);
  }

  async getAllDonations(): Promise<any[]> {
    return await db
      .select({
        id: donations.id,
        amount: donations.amount,
        name: donations.name,
        email: donations.email,
        phone: donations.phone,
        address: donations.address,
        panCard: donations.panCard,
        message: donations.message,
        paymentId: donations.paymentId,
        status: donations.status,
        createdAt: donations.createdAt,
        categoryName: donationCategories.name,
        eventTitle: events.title,
        invoiceNumber: donations.invoiceNumber,
        receiptSent: donations.receiptSent,
        notificationSent: donations.notificationSent
      })
      .from(donations)
      .leftJoin(donationCategories, eq(donations.categoryId, donationCategories.id))
      .leftJoin(events, eq(donations.eventId, events.id))
      .orderBy(donations.createdAt);
  }

  async getDonation(id: number): Promise<Donation | undefined> {
    const [donation] = await db.select().from(donations).where(eq(donations.id, id));
    return donation;
  }

  async getDonationByPaymentId(paymentId: string): Promise<Donation | undefined> {
    const [donation] = await db.select().from(donations).where(eq(donations.paymentId, paymentId));
    return donation;
  }

  async getUserDonations(userId: number): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.userId, userId));
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [newDonation] = await db.insert(donations).values(donation).returning();
    return newDonation;
  }

  async updateDonation(id: number, donationData: Partial<Donation>): Promise<Donation | undefined> {
    const [donation] = await db.update(donations).set(donationData).where(eq(donations.id, id)).returning();
    return donation;
  }

  async deleteDonation(id: number): Promise<boolean> {
    const result = await db.delete(donations).where(eq(donations.id, id));
    return result.rowCount > 0;
  }

  // Subscription operations
  async getSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions);
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription;
  }

  async getSubscriptionByEmail(email: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.email, email));
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined> {
    const [subscription] = await db.update(subscriptions).set(subscriptionData).where(eq(subscriptions.id, id)).returning();
    return subscription;
  }

  async deleteSubscription(id: number): Promise<boolean> {
    const result = await db.delete(subscriptions).where(eq(subscriptions.id, id));
    return result.rowCount > 0;
  }

  // Stats operations
  async getStats(): Promise<Stat[]> {
    return await db.select().from(stats);
  }

  async getStat(id: number): Promise<Stat | undefined> {
    const [stat] = await db.select().from(stats).where(eq(stats.id, id));
    return stat;
  }

  async createStat(stat: InsertStat): Promise<Stat> {
    const [newStat] = await db.insert(stats).values(stat).returning();
    return newStat;
  }

  async updateStat(id: number, statData: Partial<Stat>): Promise<Stat | undefined> {
    const [stat] = await db.update(stats).set(statData).where(eq(stats.id, id)).returning();
    return stat;
  }

  async deleteStat(id: number): Promise<boolean> {
    const result = await db.delete(stats).where(eq(stats.id, id));
    return result.rowCount > 0;
  }

  // Schedule operations
  async getSchedules(): Promise<Schedule[]> {
    return await db.select().from(schedules);
  }

  async getSchedule(id: number): Promise<Schedule | undefined> {
    const [schedule] = await db.select().from(schedules).where(eq(schedules.id, id));
    return schedule;
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const [newSchedule] = await db.insert(schedules).values(schedule).returning();
    return newSchedule;
  }

  async updateSchedule(id: number, scheduleData: Partial<Schedule>): Promise<Schedule | undefined> {
    const [schedule] = await db.update(schedules).set(scheduleData).where(eq(schedules.id, id)).returning();
    return schedule;
  }

  async deleteSchedule(id: number): Promise<boolean> {
    const result = await db.delete(schedules).where(eq(schedules.id, id));
    return result.rowCount > 0;
  }

  // Blog post operations
  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts);
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: number, postData: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const [post] = await db.update(blogPosts).set(postData).where(eq(blogPosts.id, id)).returning();
    return post;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return result.rowCount > 0;
  }
}